<template>
    <div class="axc_input">
        <div class="col1 hover_border">
            <button class="max_but" @click="maxOut" v-if="max">MAX</button>
            <BigNumInput
                ref="amt_in"
                class="amt_in"
                contenteditable="amt_in"
                :denomination="9"
                :max="max"
                placeholder="0.00"
                @change="amount_in"
            ></BigNumInput>
        </div>
        <p class="ticker">AXC</p>
        <div v-if="balance" class="balance">
            <div>
                <p>
                    <b>{{ $t('misc.balance') }}:</b>
                    {{ balance.toLocaleString() }}
                </p>
                <!-- <p>
                    <b>$</b>
                    {{ amountUSD.toLocaleString(2) }}
                </p> -->
                <p>
                    <b>$</b>
                    {{ '--' }}
                </p>
            </div>
            <div></div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Model } from 'vue-property-decorator'
import { Utils, Big } from '@axia-systems/wallet-sdk'
//@ts-ignore
import { BigNumInput } from '@axia-systems/vue-components'
import { BN } from '@axia-systems/axiajs'
import { priceDict } from '../../store/types'

@Component({
    components: {
        BigNumInput,
    },
})
export default class AxcInput extends Vue {
    @Model('change', { type: Object }) readonly amount!: BN

    @Prop({
        default: null,
    })
    max?: BN | null

    @Prop() balance?: Big | null

    maxOut(ev: MouseEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        //@ts-ignore
        this.$refs.amt_in.maxout()
    }

    amount_in(val: BN) {
        this.$emit('change', val)
    }

    get amountUSD(): Big {
        let usdPrice = this.priceDict.usd
        let amount = Utils.bnToBig(this.amount, 9)
        let usdBig = amount.times(usdPrice)
        return usdBig
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.axc_input {
    display: grid;
    grid-template-columns: 1fr max-content;
    grid-gap: 0px 10px;
    color: var(--primary-color);
    width: 100%;
    height: 40px;

    .amt_in {
        color: var(--primary-color);
        font-size: 15px;
        font-family: monospace;
        flex-grow: 1;
        flex-shrink: 1;
        display: block;
        box-sizing: content-box;
        outline: none !important;
        border: none !important;
        //padding: 0 12px !important;
    }

    .ticker,
    .amt_in,
    .max_but {
        //border-radius: 3px;
    }
}

.balance {
    display: grid;
    column-gap: 10px;
    font-size: 14px;
    color: var(--primary-color-light);
    padding: 2px 0px;

    > div {
        display: flex;
        justify-content: space-between;
    }

    p {
        text-align: left;
        padding: 2px 0px;
    }

    p:last-child {
        text-align: right;
    }

    span {
        font-family: monospace;
        padding-left: 14px;
    }
}

.col1 {
    border: 2px solid #e6e8ec;
    border-radius: 12px;
    //display: flex;
    display: grid;
    grid-template-columns: max-content 1fr;
    width: 100%;
    box-sizing: border-box;
    //overflow: auto;
    padding: 8px 14px;
    position: relative;

    //&:hover {
    //    border-color: var(--primary-color-light);
    //}
    //&:focus-within {
    //    border-color: var(--secondary-color);
    //}
}

.ticker {
    border-radius: 3px;
    padding: 8px 14px;
}

p {
    text-align: center;
}
.max_but {
    font-size: 13px;
    opacity: 0.4;
    &:hover {
        opacity: 1;
    }
}

@include main.mobile-device {
    .balance {
        font-size: 12px;
    }
}
</style>
