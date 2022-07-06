import AxiaAsset from '@/js/AxiaAsset'
import Big from 'big.js'
import { BN } from '@axia-systems/axiajs'
// import {UTXO} from "axia";

// type AssetType = "fungible" | "collectible"

export interface ITransaction {
    uuid: string
    asset: AxiaAsset
    amount: BN
}

export interface INftTransaction {}

export interface ICurrencyInputDropdownValue {
    asset: AxiaAsset | null
    amount: BN
}
