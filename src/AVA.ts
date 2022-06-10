import { KeyChain as AVMKeyChain, AVMAPI } from 'axia/dist/apis/avm'
import { InfoAPI } from 'axia/dist/apis/info'
import Axia from 'axia'
//@ts-ignore
import BinTools from 'axia/dist/utils/bintools'
import { EVMAPI } from 'axia/dist/apis/evm'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = 'bootstrap.ava.network'
let port: number = 21000
let protocol: string = 'https'
let network_id: number = 2
let chain_id: string = 'X'
let bintools: BinTools = BinTools.getInstance()
let ava: Axia = new Axia(ip, port, protocol, network_id, chain_id)

let avm: AVMAPI = ava.XChain()
let cChain: EVMAPI = ava.CChain()
let pChain = ava.PChain()
let infoApi: InfoAPI = ava.Info()
let keyChain: AVMKeyChain = avm.keyChain()

function isValidAddress(addr: string) {
    try {
        let res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { ava, avm, pChain, cChain, infoApi, bintools, isValidAddress, keyChain }
