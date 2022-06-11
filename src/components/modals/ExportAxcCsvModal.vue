<template>
    <modal ref="modal" title="Export AVAX Transfers" class="modal_main">
        <div class="csv_modal_body">
            <p>Only X chain AVAX transactions will be exported.</p>
            <p class="err" v-if="error">{{ error }}</p>
            <v-btn
                class="button_secondary"
                small
                @click="submit"
                :disabled="!canSubmit"
                depressed
                block
                style="margin-top: 12px"
            >
                Download CSV File
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { CsvRowAxcTransferData, ITransactionData, UTXO } from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
const generate = require('csv-generate')
import {
    axcTransferDataToCsvRow,
    getOutputTotals,
    getOwnedOutputs,
    getNotOwnedOutputs,
    getAssetOutputs,
    getAddresses,
    createCSVContent,
    downloadCSVFile,
    parseMemo,
} from '@/store/modules/history/history_utils'
import { ava, avm } from '@/AVA'
import { BN } from '@zee-ava/avajs'

@Component({
    components: {
        Modal,
    },
})
export default class ExportAxcCsvModal extends Vue {
    error: Error | null = null

    open(): void {
        this.error = null
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get canSubmit() {
        return true
    }

    get transactions(): ITransactionData[] {
        return this.$store.state.History.allTransactions
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get xAddresses(): string[] {
        return this.wallet.getAllAddressesX()
    }

    get xAddressesStripped(): string[] {
        return this.xAddresses.map((addr: string) => addr.split('-')[1])
    }

    get axcID() {
        return this.$store.state.Assets.AVA_ASSET_ID
    }

    generateCSVFile() {
        let myAddresses = this.xAddressesStripped
        let axcID = this.axcID

        let txs = this.transactions.filter((tx) => {
            let axcOutAmt = tx.outputTotals[axcID]

            if (!axcOutAmt) return false

            return tx.type === 'base' || tx.type === 'operation'
        })

        let txFee = avm.getTxFee()

        let rows: CsvRowAxcTransferData[] = []
        const ZERO = new BN(0)

        for (let i = 0; i < txs.length; i++) {
            let tx = txs[i]

            let ins = tx.inputs || []
            let inUTXOs = ins.map((input) => input.output)

            let axcIns = getAssetOutputs(inUTXOs, axcID)
            let axcOuts = getAssetOutputs(tx.outputs, axcID)

            let myIns = getOwnedOutputs(axcIns, myAddresses)
            let myOuts = getOwnedOutputs(axcOuts, myAddresses)

            let inTot = getOutputTotals(myIns)
            let outTot = getOutputTotals(myOuts)

            let gain = outTot.sub(inTot)

            let otherIns = getNotOwnedOutputs(axcIns, myAddresses)
            let otherOuts = getNotOwnedOutputs(axcOuts, myAddresses)

            // If its only the fee, continue
            if (gain.abs().lte(txFee)) continue

            let isGain = gain.gt(ZERO)

            let fromOwnedAddrs = getAddresses(myIns)
            let toOwnedAddrs = getAddresses(myOuts)

            let fromAddrs = getAddresses(otherIns)
            let toAddrs = getAddresses(otherOuts)

            // Subtract the fee if we sent it
            let sendAmt = isGain ? gain : gain.add(txFee)

            let txParsed: CsvRowAxcTransferData = {
                txId: tx.id,
                date: new Date(tx.timestamp),
                amount: bnToBig(sendAmt, 9),
                from: isGain ? fromAddrs : fromOwnedAddrs,
                to: isGain ? toOwnedAddrs : toAddrs,
                memo: parseMemo(tx.memo),
                isGain: isGain,
            }
            rows.push(txParsed)
        }

        let csvRows = rows.map((row) => axcTransferDataToCsvRow(row))
        let headers = ['Tx ID', 'Date', 'Memo', 'From', 'To', 'Sent/Received', 'Amount (AVAX)']
        let allRows = [headers, ...csvRows]

        let csvContent = createCSVContent(allRows)
        downloadCSVFile(csvContent, 'axc_transfers')
    }

    submit() {
        try {
            this.error = null
            this.generateCSVFile()
        } catch (e) {
            this.error = e
        }
    }
}
</script>
<style scoped lang="scss">
.csv_modal_body {
    width: 420px;
    max-width: 100%;
    padding: 10px 20px;
}
</style>
