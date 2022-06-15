import { AxiaNetwork } from '@/js/AxiaNetwork'
import { BN } from '@zee-ava/avajs'

export interface NetworkState {
    networks: AxiaNetwork[]
    networksCustom: AxiaNetwork[]
    selectedNetwork: null | AxiaNetwork
    // isConnected: boolean
    status: NetworkStatus

    txFee: BN
}

export type NetworkStatus = 'disconnected' | 'connecting' | 'connected'

export interface NetworkItem {
    name: string
    url: string
    protocol: string
    port: number
    networkId: number
    chainId: string
}
