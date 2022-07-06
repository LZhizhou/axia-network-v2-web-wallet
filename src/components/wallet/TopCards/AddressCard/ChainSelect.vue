<template>
    <div class="chain_select">
        <button @click="setChain('Swap')" :active="chain === 'Swap'">Swap</button>
        <button @click="setChain('Core')" :active="chain === 'Core'">Core</button>
        <button @click="setChain('AX')" :active="chain === 'AX'" v-if="isEVMSupported">AX</button>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Model } from 'vue-property-decorator'
import { ChainAlias, WalletType } from '@/js/wallets/types'

@Component
export default class ChainSelect extends Vue {
    @Model('change', { type: String }) readonly chain!: ChainAlias

    get isEVMSupported() {
        let wallet: WalletType | null = this.$store.state.activeWallet
        if (!wallet) return false
        return wallet.ethAddress
    }

    setChain(val: ChainAlias) {
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
.chain_select {
    margin: 10px;
    margin-bottom: 0 !important;
    border: 1px solid #9ccded;
    border-radius: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    font-size: 13px;
    color: var(--primary-color-light);
    background-color: var(--bg-wallet);
}
button {
    padding: 8px 5px;
    opacity: 0.8;
    outline: none !important;
    font-weight: bold;
    background-color: rgba(var(--bg-1), 0.5);
    &:hover {
        opacity: 1;
        color: #178fe1;
    }
    &[active] {
        opacity: 1;
        background: #178fe1;
        margin: 2px;
        border-radius: 20px;
        padding: 5px;
        color: #fff;
    }
}
</style>
