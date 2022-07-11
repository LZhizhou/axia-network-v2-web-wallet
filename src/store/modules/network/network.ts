import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { NetworkState } from '@/store/modules/network/types'

import { axia, avm, bintools, axChain, infoApi, coreChain } from '@/AXIA'
import { AxiaNetwork } from '@/js/AxiaNetwork'
import { explorer_api } from '@/explorer_api'
import { BN } from '@axia-systems/axiajs'
import { getPreferredHRP } from '@axia-systems/axiajs/dist/utils'
import router from '@/router'
import { web3 } from '@/evm'
import { setSocketNetwork } from '../../../providers'
import { Network } from '@axia-systems/wallet-sdk'
const network_module: Module<NetworkState, RootState> = {
    namespaced: true,
    state: {
        status: 'disconnected', // disconnected | connecting | connected
        networks: [],
        networksCustom: [],
        selectedNetwork: null,
        txFee: new BN(0),
    },
    mutations: {
        addNetwork(state, net: AxiaNetwork) {
            state.networks.push(net)
        },
    },
    getters: {
        allNetworks(state) {
            return state.networks.concat(state.networksCustom)
        },
    },
    actions: {
        addCustomNetwork({ state, dispatch }, net: AxiaNetwork) {
            // Check if network alerady exists
            let networks = state.networksCustom
            // Do not add if there is a network already with the same url
            for (var i = 0; i < networks.length; i++) {
                let url = networks[i].url
                if (net.url === url) {
                    return
                }
            }
            state.networksCustom.push(net)
            dispatch('save')
        },

        async removeCustomNetwork({ state, dispatch }, net: AxiaNetwork) {
            let index = state.networksCustom.indexOf(net)
            state.networksCustom.splice(index, 1)
            await dispatch('save')
        },
        saveSelectedNetwork({ state }) {
            let data = JSON.stringify(state.selectedNetwork?.url)
            localStorage.setItem('network_selected', data)
        },
        async loadSelectedNetwork({ dispatch, getters }): Promise<boolean> {
            let data = localStorage.getItem('network_selected')
            if (!data) return false
            try {
                // let net: AxiaNetwork = JSON.parse(data);
                let nets: AxiaNetwork[] = getters.allNetworks

                for (var i = 0; i < nets.length; i++) {
                    let net = nets[i]
                    if (JSON.stringify(net.url) === data) {
                        dispatch('setNetwork', net)
                        return true
                    }
                }
                return false
            } catch (e) {
                return false
            }
        },

        // Save custom networks to local storage
        save({ state }) {
            let data = JSON.stringify(state.networksCustom)
            localStorage.setItem('networks', data)
        },
        // Load custom networks from local storage
        load({ dispatch }) {
            let data = localStorage.getItem('networks')

            if (data) {
                let networks: AxiaNetwork[] = JSON.parse(data)

                networks.forEach((n) => {
                    let newCustom = new AxiaNetwork(
                        n.name,
                        n.url,
                        //@ts-ignore
                        parseInt(n.networkId),
                        n.explorerUrl,
                        n.explorerSiteUrl,
                        n.readonly
                    )
                    dispatch('addCustomNetwork', newCustom)
                })
            }
        },
        async setNetwork({ state, dispatch, commit, rootState }, net: AxiaNetwork) {
            state.status = 'connecting'

            // Chose if the network should use credentials
            await net.updateCredentials()
            axia.setRequestConfig('withCredentials', net.withCredentials)
            axia.setAddress(net.ip, net.port, net.protocol)
            axia.setNetworkID(net.networkId)

            // Reset transaction history
            commit('History/clear', null, { root: true })

            // Query the network to get network id
            let chainIdX = await infoApi.getBlockchainID('Swap')
            let chainIdP = await infoApi.getBlockchainID('Core')
            let chainIdC = await infoApi.getBlockchainID('AX')

            avm.refreshBlockchainID(chainIdX)
            avm.setBlockchainAlias('Swap')
            coreChain.refreshBlockchainID(chainIdP)
            coreChain.setBlockchainAlias('Core')
            axChain.refreshBlockchainID(chainIdC)
            axChain.setBlockchainAlias('AX')

            avm.getAXCAssetID(true)
            coreChain.getAXCAssetID(true)
            axChain.getAXCAssetID(true)

            state.selectedNetwork = net
            dispatch('saveSelectedNetwork')

            // Update explorer api
            explorer_api.defaults.baseURL = net.explorerUrl

            // Set web3 Network Settings
            let web3Provider = `${net.protocol}://${net.ip}:${net.port}/ext/bc/AX/rpc`
            web3.setProvider(web3Provider)

            // Set socket connections
            setSocketNetwork(net)

            commit('Assets/removeAllAssets', null, { root: true })
            await dispatch('Assets/updateAxiaAsset', null, { root: true })

            // If authenticated
            if (rootState.isAuth) {
                // Go back to wallet page
                router.replace('/wallet')
                for (var i = 0; i < rootState.wallets.length; i++) {
                    let w = rootState.wallets[i]
                    w.onnetworkchange()
                }
            }

            await dispatch('Assets/onNetworkChange', net, { root: true })
            dispatch('Assets/updateUTXOs', null, { root: true })
            dispatch('Platform/update', null, { root: true })
            dispatch('Platform/updateMinStakeAmount', null, { root: true })
            dispatch('updateTxFee')
            // Update tx history
            dispatch('History/updateTransactionHistory', null, { root: true })

            // Set the SDK Network
            let sdkNetConf = await Network.getConfigFromUrl(net.getFullURL())
            await Network.setNetworkAsync(sdkNetConf)
            // state.isConnected = true;
            state.status = 'connected'
            return true
        },

        async updateTxFee({ state }) {
            let txFee = await infoApi.getTxFee()
            state.txFee = txFee.txFee
            avm.setTxFee(txFee.txFee)
        },

        async init({ state, commit, dispatch }) {
            let mainnet = new AxiaNetwork(
                'Mainnet',
                'https://1.p2p-v2.mainnet.axiacoin.network:443',
                1,
                'https://magellan-v2.mainnet.axiacoin.network',
                'https://axscan-v2.mainnet.axiacoin.network',
                true
            )

            let testnet = new AxiaNetwork(
                'Testnet',
                'https://1.p2p-v2.testnet.axiacoin.network:443',
                5,
                'https://magellan-v2.testnet.axiacoin.network',
                'https://axscan-v2.testnet.axiacoin.network',
                true
            )

            // Load custom networks if any
            try {
                await dispatch('load')
            } catch (e) {
                console.error(e)
            }

            commit('addNetwork', mainnet)
            commit('addNetwork', testnet)

            try {
                let isSet = await dispatch('loadSelectedNetwork')
                if (!isSet) {
                    await dispatch('setNetwork', state.networks[0])
                }
                return true
            } catch (e) {
                console.log(e)
                state.status = 'disconnected'
            }
        },
    },
}

export default network_module
