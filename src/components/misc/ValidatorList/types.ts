export interface ValidatorRaw {
    connection: boolean
    endTime: string
    nodeID: string
    stakeAmount: string
    startTime: string
    uptime: string
    nominationFee: string
    nominators: NominatorRaw[] | null
    potentialReward: string
    rewardOwner: ValidatorRewardOwner
    txID: string
}

export interface NominatorRaw {
    endTime: string
    nodeID: string
    potentialReward: string
    rewardOwner: ValidatorRewardOwner
    stakeAmount: string
    startTime: string
    txID: string
}

export interface NominatorPendingRaw {
    startTime: string
    endTime: string
    stakeAmount: string
    nodeID: string
}

export interface ValidatorPendingRaw {
    startTime: string
    endTime: string
    stakeAmount: string
    nodeID: string
    nominationFee: string
    connected: boolean
}

export interface ValidatorRewardOwner {
    addresses: string[]
    locktime: string
    threshold: string
}

export interface ValidatorDict {
    [nodeId: string]: ValidatorRaw
}
