<template>
    <div class="studio-clr">
        <div class="header">
            <h1>{{ $t('studio.title') }}</h1>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel"><fa icon="times"></fa></span>
            </h1>
        </div>
        <template v-if="!pageNow">
            <p>{{ $t('studio.desc') }}</p>
            <div class="menu">
                <div class="header">
                    <div class="collectible_icon"><img src="@/assets/balance_sync.png" /></div>
                    <h2>{{ $t('studio.collectibles') }}</h2>
                </div>
                <div class="options">
                    <div>
                        <h4 class="title">{{ $t('studio.menu1.title') }}</h4>
                        <p>{{ $t('studio.menu1.desc') }}</p>
                        <v-btn @click="goNewNftFamily" class="button_secondary" small depressed>
                            {{ $t('studio.menu1.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">{{ $t('studio.menu2.title') }}</h4>
                        <p>{{ $t('studio.menu2.desc') }}</p>
                        <div>
                            <p v-if="!canMint" class="err">
                                {{ $t('studio.menu2.empty') }}
                            </p>
                            <v-btn
                                @click="goMint"
                                class="button_secondary"
                                small
                                depressed
                                :disabled="!canMint"
                            >
                                {{ $t('studio.menu2.submit') }}
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <Component v-else :is="pageNow" @cancel="cancel"></Component>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NewCollectibleFamily from '@/components/wallet/studio/NewCollectibleFamily.vue'
import MintNft from '@/components/wallet/studio/mint/MintNft.vue'
import { IWalletNftMintDict } from '@/store/types'
import Big from 'big.js'
import { bnToBig } from '@/helpers/helper'
import { avm } from '@/AXIA'
import { BN } from '@zee-ava/avajs'
@Component({
    name: 'studio',
    components: {
        NewCollectibleFamily,
    },
})
export default class Studio extends Vue {
    pageNow: any = null
    subtitle: string = ''

    goNewNftFamily() {
        this.pageNow = NewCollectibleFamily
        this.subtitle = 'New Collectible Family'
    }

    goMint() {
        this.pageNow = MintNft
        this.subtitle = 'Mint Collectible'
    }

    get nftMintDict(): IWalletNftMintDict {
        // return this.$store.getters.walletNftMintDict
        return this.$store.getters['Assets/nftMintDict']
    }

    get canMint(): boolean {
        const keys = Object.keys(this.nftMintDict)
        if (keys.length > 0) return true
        return false
    }

    deactivated() {
        this.clearPage()
    }

    activated() {
        let utxoId = this.$route.query.utxo

        if (utxoId) {
            this.goMint()
        }
    }

    // If url has a utxo id, clears it
    clearUrl() {
        let utxoId = this.$route.query.utxo

        if (utxoId) {
            //@ts-ignore
            this.$router.replace({ query: null })
        }
    }

    clearPage() {
        this.pageNow = null
        this.subtitle = ''
    }

    cancel() {
        this.clearUrl()
        this.clearPage()
    }
}
</script>
<style scoped lang="scss">
.header {
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    h1 {
        font-weight: lighter;
    }

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

.menu {
    box-shadow: 0px 4px 16px rgba(20, 92, 143, 0.08);
    border-radius: 12px;
    background-color: #fff;
    padding: 10px 25px;
    h2 {
        margin: 20px 0;
        color: var(--primary-color-light);
        font-weight: normal;
        font-size: 2em;
    }
}

.studio-clr {
    background-color: #f8f9fa !important;
    box-shadow: none !important;
}
.options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 14px;
    > div {
        border-radius: 12px;
        border: 2px solid #e9f6ff;
        padding: 30px;
        display: flex;
        flex-direction: column;

        &:hover {
            background-color: var(--bg-light);
        }
    }

    p {
        flex-grow: 1;
        margin: 12px 0 !important;
    }

    h4 {
        font-size: 32px !important;
        font-weight: lighter;
        color: var(--primary-color-light);
    }

    .v-btn {
        width: 100%;
        background: #178fe1 !important;
        border-radius: 12px;
        padding: 10px 10px;
    }
    .theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
        background: #178fe1 !important;
        opacity: 0.5;
        color: white !important;
    }
}
.header {
    display: flex;

    h2 {
        margin-left: 12px;
        flex-grow: 1;
    }
}
.collectible_icon {
    width: 20px;
    height: 20px;
    color: var(--primary-color);

    img {
        object-fit: contain;
        width: 100%;
    }
}
</style>
