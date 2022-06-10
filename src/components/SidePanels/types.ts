import { BN } from 'axia'
export interface TransactionValueDict {
    [address: string]: number
}

export interface TransactionAssetsDict {
    [assetId: string]: {
        amount: BN
        addresses: Set<string>
    }
}
