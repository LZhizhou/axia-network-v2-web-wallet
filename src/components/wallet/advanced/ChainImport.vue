<template>
    <div class="chain_import">
        <h2>{{ $t('advanced.import.title') }}</h2>
        <p>{{ $t('advanced.import.desc') }}</p>
        <div v-if="isSuccess" class="is_success">
            <label>Tx ID</label>
            <p class="tx_id">{{ txId }}</p>
        </div>
        <p class="err" v-else-if="err">{{ err }}</p>
        <template v-if="!isLoading">
            <select @input="onChangeSource" class="select-core">
                <option value="SwapCore">Import Swap (From Core)</option>
                <option value="SwapAx">Import Swap (From AX)</option>
                <option value="CoreSwap">Import Core (From Swap)</option>
                <option value="CoreAx">Import Core (From AX)</option>
                <option value="AxSwap">Import AX (from Swap)</option>
                <option value="AxCore">Import AX (from Core)</option>
            </select>
            <v-btn block class="button_secondary" @click="importKey" large :style="{ top: '30%' }">
                Import
            </v-btn>
        </template>
        <Spinner class="spinner" v-else></Spinner>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Spinner from '@/components/misc/Spinner.vue'
import { WalletType } from '@/js/wallets/types'
import { BN } from '@axia-systems/axiajs'
import {
    ExportChainsAX,
    ExportChainsCore,
    ExportChainsSwap,
    GasHelper,
    Network,
    NetworkHelper,
    Utils,
} from '@axia-systems/wallet-sdk'

@Component({
    components: { Spinner },
})
export default class ChainImport extends Vue {
    err = ''
    isSuccess = false
    isLoading = false
    txId = ''
    selected: string = ''

    get wallet(): null | WalletType {
        let wallet: null | WalletType = this.$store.state.activeWallet
        return wallet
    }

    get isEVMSupported() {
        if (!this.wallet) return false
        return this.wallet.ethAddress
    }

    async atomicImportSwap(sourceChain: ExportChainsSwap) {
        this.beforeSubmit()
        if (!this.wallet) return

        // // Import from AX
        try {
            let txId = await this.wallet.importToSwapChain(sourceChain)
            this.onSuccess(txId)
        } catch (e) {
            if (this.isSuccess) return
            this.onError(e)
        }
    }

    async atomicImportCore(source: ExportChainsCore) {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            let txId = await this.wallet.importToPlatformChain(source)
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
        }
    }

    async atomicImportAX(source: ExportChainsAX) {
        this.beforeSubmit()
        if (!this.wallet) return
        try {
            const utxoSet = await this.wallet.evmGetAtomicUTXOs(source)
            const utxos = utxoSet.getAllUTXOs()

            const numIns = utxos.length
            const baseFee = await GasHelper.getBaseFeeRecommended()

            if (numIns === 0) {
                throw new Error('Nothing to import.')
            }

            // Calculate number of signatures
            const numSigs = utxos.reduce((acc, utxo) => {
                return acc + utxo.getOutput().getAddresses().length
            }, 0)

            const gas = GasHelper.estimateImportGasFeeFromMockTx(numIns, numSigs)

            const totFee = baseFee.mul(new BN(gas))
            let txId = await this.wallet.importToAXChain(source, Utils.axcAXtoSwap(totFee))
            this.onSuccess(txId)
        } catch (e) {
            this.onError(e)
        }
    }

    deactivated() {
        this.err = ''
        this.txId = ''
        this.isSuccess = false
    }

    beforeSubmit() {
        this.isLoading = true
        this.err = ''
        this.isSuccess = false
        this.txId = ''
    }

    onSuccess(txId: string) {
        this.isLoading = false
        this.err = ''
        this.isSuccess = true
        this.txId = txId

        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Import Success',
            message: txId,
        })

        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
        }, 3000)
    }

    onError(err: Error) {
        this.isLoading = false
        let msg = ''
        if (err.message.includes('No atomic')) {
            this.err = 'Nothing found to import.'
            return
        } else {
            this.err = err.message
        }
    }
    onChangeSource(ev: any) {
        let val = ev.target.value
        this.selected = val
    }
    importKey() {
        let key = this.selected
        if (key === 'SwapCore') {
            this.atomicImportSwap('Core')
        }
        if (key === 'SwapAx') {
            this.atomicImportSwap('AX')
        }
        if (key === 'CoreSwap') {
            this.atomicImportCore('Swap')
        }
        if (key === 'CoreAx') {
            this.atomicImportCore('AX')
        }
        if (key === 'AxSwap') {
            this.atomicImportAX('Swap')
        }
        if (key === 'AxCore') {
            this.atomicImportAX('Core')
        }
    }
}
</script>
<style scoped lang="scss">
.v-btn {
    margin: 8px 0;
    background: #178fe1 !important;
    color: white !important;
}
.chain_import {
    background-color: #fff;
}
.is_success {
    label {
        color: var(--primary-color-light);
    }
}

.spinner {
    color: var(--primary-color) !important;
    margin: 14px auto !important;
}

.tx_id {
    font-size: 13px;
    word-break: break-all;
}
.select-core {
    background: url('../../../assets/dropdownicon.svg') no-repeat right;
    padding: 10px 30px;
    border: 2px solid #edeef5;
    border-radius: 12px;
}
</style>
