import { UTXO } from '@zee-ava/avajs/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
