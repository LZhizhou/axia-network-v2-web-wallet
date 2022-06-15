import {
    NominatorPendingRaw,
    NominatorRaw,
    ValidatorPendingRaw,
    ValidatorRaw,
} from '@/components/misc/ValidatorList/types'
import { BN } from '@zee-ava/avajs'

export interface PlatformState {
    validators: ValidatorRaw[]
    validatorsPending: ValidatorPendingRaw[]
    nominatorsPending: NominatorPendingRaw[]
    minStake: BN
    minStakeDelegation: BN
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
    delegatedStake: BN
    remainingStake: BN
    numNominators: number
    startTime: Date
    endTime: Date
    uptime: number
    fee: number
}
