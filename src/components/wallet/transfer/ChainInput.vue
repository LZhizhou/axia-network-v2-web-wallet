<template>
    <div v-if="isEVMSupported">
        <label :style="{ fontSize: '25px', fontWeight: '600', color: 'black' }">
            {{ $t('transfer.source_chain.title') }}
        </label>
        <div class="chain_select">
            <button :active="formType === 'Swap'" @click="set('Swap')">Swap</button>
            <button :active="formType === 'AX'" @click="set('AX')">AX</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop } from 'vue-property-decorator'
import { ChainIdType } from '@/constants'
import { CurrencyType } from '@/components/misc/CurrencySelect/types'

@Component
export default class ChainInput extends Vue {
    @Model('change', { type: String }) readonly formType!: CurrencyType
    @Prop({ default: false }) disabled!: boolean

    set(val: ChainIdType) {
        if (this.disabled) return
        this.$emit('change', val)
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get isEVMSupported() {
        return this.wallet.ethAddress
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';
label {
    color: var(--primary-color-light);
}
.chain_select {
    display: flex;
    border: 1px solid #9ccded;
    border-radius: 50px;
    width: max-content;
    > button {
        //border: 1px solid var(--primary-color);
        //margin-right: 14px;
        padding-right: 14px;
        opacity: 0.9;
        transition-duration: 0.1s;
        cursor: pointer;
        color: #9ccded;
        //background-color: var(--bg-light);
        display: flex;
        align-items: center;
        font-size: 16px;
        margin: 5px;

        &:hover {
            opacity: 1;
        }
        &[active] {
            background: #178fe1;
            border-radius: 20px;
            opacity: 1;
            color: #fff;
            margin: 2px;
            padding: 0 20px;
        }
    }
}

@include main.mobile-device {
    .chain_select {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 14px;
        > button {
            margin: 0;
            justify-content: center;
            text-align: center;
            background-color: var(--bg-light);
            color: var(--primary-color-light);

            &[active] {
                //background-color: var(--secondary-color);
                color: var(--primary-color);
                //color: #fff;
            }
        }
    }
}
</style>
