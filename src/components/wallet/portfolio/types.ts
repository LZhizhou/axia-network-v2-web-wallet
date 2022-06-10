import { UTXO } from 'axia/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
