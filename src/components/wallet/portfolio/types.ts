import { UTXO } from '@axia-systems/axiajs/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
