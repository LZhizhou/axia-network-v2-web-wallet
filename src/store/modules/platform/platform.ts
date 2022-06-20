import { Module } from 'vuex'
import { RootState } from '@/store/types'

import { BN } from '@zee-ava/avajs'
import { coreChain } from '@/AXIA'

import {
    GetPendingValidatorsResponse,
    GetValidatorsResponse,
    PlatformState,
    ValidatorNominatorDict,
    ValidatorNominatorPendingDict,
    ValidatorDict,
    ValidatorGroup,
    ValidatorListItem,
} from '@/store/modules/platform/types'
import {
    NominatorPendingRaw,
    NominatorRaw,
    ValidatorRaw,
} from '@/components/misc/ValidatorList/types'
import { ONEAXC } from '@zee-ava/avajs/dist/utils'
import { values } from 'cypress/types/lodash'

const MINUTE_MS = 60000
const HOUR_MS = MINUTE_MS * 60
const DAY_MS = HOUR_MS * 24

const platform_module: Module<PlatformState, RootState> = {
    namespaced: true,
    state: {
        validators: [],
        validatorsPending: [],
        // nominators: [],
        nominatorsPending: [],
        minStake: new BN(0),
        minStakeDelegation: new BN(0),
        currentSupply: new BN(1),
    },
    mutations: {
        setValidators(state, validators: ValidatorRaw[]) {
            state.validators = validators
        },
    },
    actions: {
        async updateCurrentSupply({ state }) {
            state.currentSupply = await coreChain.getCurrentSupply()
        },

        async updateMinStakeAmount({ state }) {
            let res = await coreChain.getMinStake(true)
            state.minStake = res.minValidatorStake
            state.minStakeDelegation = res.minNominatorStake

            // console.log(state.minStake.toString())
            // console.log(state.minStakeDelegation.toString())
        },

        async update({ dispatch }) {
            dispatch('updateValidators')
            dispatch('updateValidatorsPending')
            dispatch('updateCurrentSupply')
        },

        async updateValidators({ state, commit }) {
            let res = (await coreChain.getCurrentValidators()) as GetValidatorsResponse
            let validators = res.validators
            commit('setValidators', validators)
        },

        async updateValidatorsPending({ state, commit }) {
            let res = (await coreChain.getPendingValidators()) as GetPendingValidatorsResponse
            let validators = res.validators
            let nominators = res.nominators

            //@ts-ignore
            state.validatorsPending = validators
            state.nominatorsPending = nominators
        },
    },
    getters: {
        validatorListEarn(state, getters): ValidatorListItem[] {
            // Filter validators we do not need
            let now = Date.now()

            let validators = state.validators
            validators = validators.filter((v) => {
                let endTime = parseInt(v.endTime) * 1000
                let dif = endTime - now

                // If End time is less than 2 weeks + 1 hour, remove from list they are no use
                let threshold = DAY_MS * 14 + 10 * MINUTE_MS
                if (dif <= threshold) {
                    return false
                }

                return true
            })

            let nominatorMap: ValidatorNominatorDict = getters.nodeNominatorMap
            let nominatorPendingMap: ValidatorNominatorPendingDict = getters.nodeNominatorPendingMap

            let res: ValidatorListItem[] = []

            for (var i = 0; i < validators.length; i++) {
                let v = validators[i]

                let nodeID = v.nodeID

                let nominators: NominatorRaw[] = nominatorMap[nodeID] || []
                let nominatorsPending: NominatorPendingRaw[] = nominatorPendingMap[nodeID] || []

                let delegatedAmt = new BN(0)
                let delegatedPendingAmt = new BN(0)

                if (nominators) {
                    delegatedAmt = nominators.reduce((acc: BN, val: NominatorRaw) => {
                        return acc.add(new BN(val.stakeAmount))
                    }, new BN(0))
                }

                if (nominatorsPending) {
                    delegatedPendingAmt = nominatorsPending.reduce(
                        (acc: BN, val: NominatorPendingRaw) => {
                            return acc.add(new BN(val.stakeAmount))
                        },
                        new BN(0)
                    )
                }

                let startTime = new Date(parseInt(v.startTime) * 1000)
                let endTime = new Date(parseInt(v.endTime) * 1000)

                let delegatedStake = delegatedAmt.add(delegatedPendingAmt)
                let validatorStake = new BN(v.stakeAmount)
                // Calculate remaining stake
                let absMaxStake = ONEAXC.mul(new BN(3000000))
                let relativeMaxStake = validatorStake.mul(new BN(5))
                let stakeLimit = BN.min(absMaxStake, relativeMaxStake)

                let remainingStake = stakeLimit.sub(validatorStake).sub(delegatedStake)

                let listItem: ValidatorListItem = {
                    nodeID: v.nodeID,
                    validatorStake: validatorStake,
                    delegatedStake: delegatedStake,
                    remainingStake: remainingStake,
                    numNominators: nominators.length + nominatorsPending.length,
                    startTime: startTime,
                    endTime,
                    uptime: parseFloat(v.uptime),
                    fee: parseFloat(v.delegationFee),
                }
                res.push(listItem)
            }

            res = res.filter((v) => {
                // Remove if remaining space is less than minimum
                let min = state.minStakeDelegation
                if (v.remainingStake.lt(min)) return false
                return true
            })

            return res
        },

        // Maps nominators to a node id

        nodeNominatorMap(state): ValidatorNominatorDict {
            let res: ValidatorNominatorDict = {}
            let validators = state.validators
            for (var i = 0; i < validators.length; i++) {
                let validator = validators[i]
                let nodeID = validator.nodeID
                res[nodeID] = validator.nominators || []
            }
            return res
        },

        nodeNominatorPendingMap(state): ValidatorNominatorPendingDict {
            let res: ValidatorNominatorPendingDict = {}
            let nominators = state.nominatorsPending
            for (var i = 0; i < nominators?.length; i++) {
                let nominator = nominators[i]
                let nodeID = nominator.nodeID
                let target = res[nodeID]

                if (target) {
                    res[nodeID].push(nominator)
                } else {
                    res[nodeID] = [nominator]
                }
            }
            return res
        },

        // Given a validator list item, calculate the max stake of this item
        validatorMaxStake: (state, getters) => (validator: ValidatorListItem) => {
            let stakeAmt = validator.validatorStake

            // 5 times the validator's stake
            let relativeMaxStake = stakeAmt.mul(new BN(5))

            // absolute max stake
            let mult = new BN(10).pow(new BN(6 + 9))
            let absMaxStake = new BN(3).mul(mult)

            if (relativeMaxStake.lt(absMaxStake)) {
                return relativeMaxStake
            } else {
                return absMaxStake
            }
        },

        // Returns total active and pending delegation amount for the given node id
        // validatorTotalDelegated: (state, getters) => (nodeId: string) => {
        //     // let validator: ValidatorRaw = getters.validatorsDict[nodeId];
        //
        //     let nominators: NominatorRaw[]|undefined = getters.nodeNominatorMap[nodeId];
        //     let nominatorsPending: NominatorPendingRaw[]|undefined = getters.nodeNominatorPendingMap[nodeId];
        //
        //     // let stakeTotal = new BN(validator.stakeAmount);
        //
        //     let activeTotal = new BN(0);
        //     let pendingTotal = new BN(0);
        //
        //     if(nominators){
        //         activeTotal = nominators.reduce((acc: BN, val: NominatorRaw) => {
        //             let valBn = new BN(val.stakeAmount);
        //             return acc.add(valBn);
        //         }, new BN(0));
        //     }
        //
        //     if(nominatorsPending){
        //         pendingTotal = nominatorsPending.reduce((acc: BN, val: NominatorPendingRaw) => {
        //             let valBn = new BN(val.stakeAmount);
        //             return acc.add(valBn);
        //         }, new BN(0));
        //     }
        //
        //     let totDel = activeTotal.add(pendingTotal);
        //     return totDel;
        // },
    },
}

export default platform_module
