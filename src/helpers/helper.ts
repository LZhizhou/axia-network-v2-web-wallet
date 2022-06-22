import { axia } from '@/AXIA'

import {
    KeyChain as AVMKeyChain,
    KeyPair as AVMKeyPair,
    NFTTransferOutput,
    UTXO,
} from '@zee-ava/avajs/dist/apis/avm'

import {
    Defaults,
    getPreferredHRP,
    ONEAXC,
    PayloadBase,
    PayloadTypes,
} from '@zee-ava/avajs/dist/utils'
import Big from 'big.js'

import { Buffer, BN } from '@zee-ava/avajs'
import createHash from 'create-hash'

function bnToBig(val: BN, denomination = 0): Big {
    return new Big(val.toString()).div(Math.pow(10, denomination))
}

function keyToKeypair(key: string, chainID: string = 'Swap'): AVMKeyPair {
    let hrp = getPreferredHRP(axia.getNetworkID())
    let keychain = new AVMKeyChain(hrp, chainID)
    return keychain.importKey(key)
}

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN): BN {
    let networkID = axia.getNetworkID()

    //@ts-ignore
    let defValues = Defaults.network[networkID]

    if (!defValues) {
        console.error('Network default values not found.')
        return new BN(0)
    }
    const defPlatformVals = defValues.Core

    let maxConsumption: number = defPlatformVals.maxConsumption
    let minConsumption: number = defPlatformVals.minConsumption
    let diffConsumption = maxConsumption - minConsumption
    let maxSupply: BN = defPlatformVals.maxSupply
    let maxStakingDuration: BN = defPlatformVals.maxStakingDuration
    let remainingSupply = maxSupply.sub(currentSupply)

    let amtBig = Big(amount.div(ONEAXC).toString())
    let currentSupplyBig = Big(currentSupply.div(ONEAXC).toString())
    let remainingSupplyBig = Big(remainingSupply.div(ONEAXC).toString())
    let portionOfExistingSupplyBig = amtBig.div(currentSupplyBig)

    let portionOfStakingDuration = duration / maxStakingDuration.toNumber()
    let mintingRate = minConsumption + diffConsumption * portionOfStakingDuration

    let rewardBig: Big = remainingSupplyBig.times(portionOfExistingSupplyBig)
    rewardBig = rewardBig.times(Big(mintingRate * portionOfStakingDuration))

    let rewardStr = rewardBig.times(Math.pow(10, 9)).toFixed(0)
    let rewardBN = new BN(rewardStr)

    return rewardBN
}

function digestMessage(msgStr: string) {
    let mBuf = Buffer.from(msgStr, 'utf8')
    let msgSize = Buffer.alloc(4)
    msgSize.writeUInt32BE(mBuf.length, 0)
    let msgBuf = Buffer.from(`\x1AAxia Signed Message:\n${msgSize}${msgStr}`, 'utf8')
    return createHash('sha256').update(msgBuf).digest()
}

let payloadtypes = PayloadTypes.getInstance()

function getPayloadFromUTXO(utxo: UTXO): PayloadBase {
    let out = utxo.getOutput() as NFTTransferOutput
    let payload = out.getPayloadBuffer()

    let typeId = payloadtypes.getTypeID(payload)
    let pl: Buffer = payloadtypes.getContent(payload)
    let payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

    return payloadbase
}

export { keyToKeypair, calculateStakingReward, bnToBig, digestMessage, getPayloadFromUTXO }
