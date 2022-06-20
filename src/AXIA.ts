import { KeyChain as AVMKeyChain, AVMAPI } from '@zee-ava/avajs/dist/apis/avm'
import { InfoAPI } from '@zee-ava/avajs/dist/apis/info'
import Axia from '@zee-ava/avajs'
import BinTools from '@zee-ava/avajs/dist/utils/bintools'
import { EVMAPI } from '@zee-ava/avajs/dist/apis/evm'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = 'bootstrap.ava.network'
let port: number = 21000
let protocol: string = 'https'
let network_id: number = 2
let chain_id: string = 'X'
let bintools: BinTools = BinTools.getInstance()
let axia: Axia = new Axia(ip, port, protocol, network_id, chain_id)

let avm: AVMAPI = axia.SwapChain()
let axChain: EVMAPI = axia.AXChain()
let coreChain = axia.CoreChain()
let infoApi: InfoAPI = axia.Info()
let keyChain: AVMKeyChain = avm.keyChain()

function isValidAddress(addr: string) {
    try {
        let res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { axia, avm, coreChain, axChain, infoApi, bintools, isValidAddress, keyChain }
