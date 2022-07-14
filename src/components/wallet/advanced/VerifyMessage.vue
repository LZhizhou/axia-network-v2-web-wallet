<template>
    <div>
        <h2>{{ $t('advanced.verify.title') }}</h2>
        <p style="margin-bottom: 14px !important">
            {{ $t('advanced.verify.desc') }}
        </p>
        <div>
            <label>{{ $t('advanced.verify.label1') }}</label>
            <textarea placeholder="Message" v-model="message"></textarea>
        </div>
        <div>
            <label>{{ $t('advanced.verify.label2') }}</label>
            <textarea placeholder="Signature" v-model="signature"></textarea>
        </div>
        <p class="err">{{ error }}</p>
        <v-btn
            class="button_secondary"
            block
            large
            depressed
            @click="verify"
            :disabled="!canSubmit"
            :style="{ top: '5%' }"
        >
            {{ $t('advanced.verify.submit') }}
        </v-btn>
        <div v-if="addressX" class="result">
            <label>{{ $t('advanced.verify.label3') }}</label>
            <p class="address">{{ addressX }}</p>
            <p class="address">{{ addressP }}</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { KeyPair } from '@axia-systems/axiajs/dist/apis/avm'
import { axia, bintools } from '@/AXIA'
import createHash from 'create-hash'
import { getPreferredHRP } from '@axia-systems/axiajs/dist/utils'
import { avm } from '@/AXIA'
import { Buffer } from '@axia-systems/axiajs'
import { digestMessage } from '@/helpers/helper'

@Component
export default class VerifyMessage extends Vue {
    message: string = ''
    addressX: string = ''
    addressP: string = ''
    signature = ''
    error = ''

    submit() {
        this.addressX = ''
        this.addressP = ''
        this.error = ''
        try {
            this.verify()
        } catch (e) {
            //@ts-ignore
            this.error = e
        }
    }
    verify() {
        let digest = digestMessage(this.message)
        let digestBuff = Buffer.from(digest.toString('hex'), 'hex')

        let networkId = axia.getNetworkID()

        let hrp = getPreferredHRP(networkId)
        let keypair = new KeyPair(hrp, 'Swap')

        let signedBuff = bintools.cb58Decode(this.signature)

        let pubKey = keypair.recover(digestBuff, signedBuff)
        let addressBuff = KeyPair.addressFromPublicKey(pubKey)
        this.addressX = bintools.addressToString(hrp, 'Swap', addressBuff)
        this.addressP = bintools.addressToString(hrp, 'Core', addressBuff)
    }

    clear() {
        this.message = ''
        this.signature = ''
        this.addressX = ''
        this.addressP = ''
        this.error = ''
    }

    deactivated() {
        this.clear()
    }

    get canSubmit() {
        if (!this.message || !this.signature) return false

        return true
    }
}
</script>
<style lang="scss" scoped>
textarea,
input,
.address {
    padding: 6px 12px;
    width: 100%;
    background-color: none;
    font-size: 13px;
}

textarea {
    background-color: white !important;
    padding: 10px;
    border: 2px solid #edeef5;
    border-radius: 12px;
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    background-color: #178fe1 !important;
    opacity: 0.5;
    color: white !important;
}

.v-btn {
    background-color: #178fe1 !important;
    color: white !important;
}
label {
    display: block;
    text-align: left;
    color: var(--primary-color-light);
    font-size: 12px;
    margin-bottom: 20px;
    margin-top: 6px;
}

textarea {
    width: 100%;
    resize: none;
    padding: 6px 12px;
    height: 40px;
}

.result {
    margin-top: 6px;
}

.address {
    margin-bottom: 1px !important;
    word-break: break-all;
}
</style>
