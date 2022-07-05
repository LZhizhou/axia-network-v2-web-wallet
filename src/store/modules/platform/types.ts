import {
    NominatorPendingRaw,
    NominatorRaw,
    ValidatorPendingRaw,
    ValidatorRaw,
} from '@/components/misc/ValidatorList/types'
import { BN } from '@axia-systems/axiajs'

export interface PlatformState {
    validators: ValidatorRaw[]
    validatorsPending: ValidatorPendingRaw[]
    nominatorsPending: NominatorPendingRaw[]
    minStake: BN
    minStakeNomination: BN
    currentSupply: BN
}

export interface GetValidatorsResponse {
    validators: ValidatorRaw[]
}

export interface GetPendingValidatorsResponse {
    validators: ValidatorPendingRaw[]
    nominators: NominatorPendingRaw[]
}

export interface ValidatorGroup {
    data: ValidatorRaw
    // nominators: NominatorRaw[]
}

export interface ValidatorNominatorDict {
    [key: string]: NominatorRaw[]
}

export interface ValidatorNominatorPendingDict {
    [key: string]: NominatorPendingRaw[]
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}

export interface ValidatorListItem {
    nodeID: string
    validatorStake: BN
    nominatedStake: BN
    remainingStake: BN
    numNominators: number
    startTime: Date
    endTime: Date
    uptime: number
    fee: number
}
