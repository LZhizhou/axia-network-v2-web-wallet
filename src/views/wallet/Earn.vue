<template>
    <div class="earn_page">
        <div class="header">
            <h1>{{ $t('earn.title') }}</h1>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel"><fa icon="times"></fa></span>
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!pageNow">
                <p>{{ $t('earn.desc') }}</p>
                <div class="options">
                    <div>
                        <h4 class="title">
                            {{ $t('earn.validate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.validate_card.desc') }}
                        </p>
                        <p v-if="!canValidate" class="no_balance">
                            {{ $t('earn.warning_1', [minStakeAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="validate"
                            @click="addValidator"
                            depressed
                            small
                            :disabled="!canValidate"
                        >
                            {{ $t('earn.validate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('earn.delegate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.delegate_card.desc') }}
                        </p>
                        <p v-if="!canDelegate" class="no_balance">
                            {{ $t('earn.warning_2', [minDelegationAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="delegate"
                            @click="addNominator"
                            depressed
                            small
                            :disabled="!canDelegate"
                        >
                            {{ $t('earn.delegate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('earn.transfer_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.transfer_card.desc') }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="swap"
                            @click="transfer"
                            depressed
                            small
                        >
                            {{ $t('earn.transfer_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('earn.rewards_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.rewards_card.desc') }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="rewards"
                            @click="viewRewards"
                            depressed
                            small
                        >
                            {{ $t('earn.rewards_card.submit') }}
                        </v-btn>
                    </div>
                </div>
                <!--                <v-btn @click="viewRewards" depressed small>View Estimated Rewards</v-btn>-->
            </div>
            <div v-else>
                <component :is="pageNow" class="comp" @cancel="cancel"></component>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import AddValidator from '@/components/wallet/earn/Validate/AddValidator.vue'
import AddNominator from '@/components/wallet/earn/Delegate/AddNominator.vue'
import { BN } from '@zee-ava/avajs/dist'
import UserRewards from '@/components/wallet/earn/UserRewards.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

@Component({
    name: 'earn',
    components: {
        UserRewards,
        AddValidator,
        AddNominator,
    },
})
export default class Earn extends Vue {
    pageNow: any = null
    subtitle: string = ''
    intervalID: any = null

    addValidator() {
        this.pageNow = AddValidator
        this.subtitle = this.$t('earn.subtitle1') as string
    }
    addNominator() {
        this.pageNow = AddNominator
        this.subtitle = this.$t('earn.subtitle2') as string
    }
    transfer() {
        this.$router.replace('/wallet/cross_chain')
    }

    viewRewards() {
        this.pageNow = UserRewards
        this.subtitle = this.$t('earn.subtitle4') as string
    }
    cancel() {
        this.pageNow = null
        this.subtitle = ''
    }

    updateValidators() {
        this.$store.dispatch('Platform/update')
    }

    created() {
        this.updateValidators()
        this.intervalID = setInterval(() => {
            this.updateValidators()
        }, 15000)
    }

    deactivated() {
        this.cancel()
    }

    destroyed() {
        clearInterval(this.intervalID)
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance'].available
    }

    get platformLockedStakeable(): BN {
        // return this.$store.getters.walletPlatformBalanceLockedStakeable
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get totBal(): BN {
        return this.platformUnlocked.add(this.platformLockedStakeable)
    }

    get pNoBalance() {
        return this.platformUnlocked.add(this.platformLockedStakeable).isZero()
    }

    get canDelegate(): boolean {
        let bn = this.$store.state.Platform.minStakeDelegation
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get canValidate(): boolean {
        let bn = this.$store.state.Platform.minStake
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get minStakeAmt(): Big {
        let bn = this.$store.state.Platform.minStake
        return bnToBig(bn, 9)
    }

    get minDelegationAmt(): Big {
        let bn = this.$store.state.Platform.minStakeDelegation
        return bnToBig(bn, 9)
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
    background-color: #f8f9fa !important;
    box-shadow: none !important;
}
.header {
    h1 {
        font-weight: normal;
    }
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    .subtitle {
        margin-left: 0.5em;
        /*font-size: 20px;*/
        color: var(--primary-color-light);
        font-weight: lighter;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}
.options {
    margin: 30px 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 14px;
    //display: flex;
    //justify-content: space-evenly;
    //padding: 60px;

    > div {
        width: 100%;
        justify-self: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        //max-width: 260px;
        padding: 30px;
        background: #ffffff;
        box-shadow: 0px 4px 16px rgba(20, 92, 143, 0.08);
        border-radius: 12px;
    }

    h4 {
        font-size: 32px !important;
        font-weight: 400;
        color: black;
    }

    p {
        /*color: var(--primary-color-light);*/
        margin: 14px 0 !important;
    }

    .no_balance {
        color: var(--secondary-color);
    }

    .v-btn {
        margin-top: 14px;
        background: #178fe1 !important;
        border-radius: 12px !important;
    }
    .v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
        background: #007cbd !important;
        color: white !important;
        opacity: 0.5;
    }
}

span {
    color: var(--primary-color-light);
    opacity: 0.5;
    float: right;
    font-weight: lighter;
}

.cancel {
    font-size: 13px;
    color: var(--secondary-color);
    justify-self: flex-end;
}

.comp {
    margin-top: 14px;
}

@include main.medium-device {
    .options {
        grid-template-columns: 1fr 1fr;
    }
}

@include main.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }
}
</style>
