import AvaAsset from '@/js/AvaAsset'
import Big from 'big.js'
import { BN } from '@zee-ava/avajs'
// import {UTXO} from "axia";

// type AssetType = "fungible" | "collectible"

export interface ITransaction {
    uuid: string
    asset: AvaAsset
    amount: BN
}

export interface INftTransaction {}

export interface ICurrencyInputDropdownValue {
    asset: AvaAsset | null
    amount: BN
}
