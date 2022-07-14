<template>
    <v-banner
        sticky
        class="url_banner"
        color="#f00"
        ref="banner"
        :style="{
            textAlign: 'center',
        }"
    >
        <template v-slot:default>
            <fa icon="exclamation-triangle"></fa>
            Make sure the URL is
            <b>wallet-v2.mainnet.axiacoin.network</b>
            <button @click="dismiss" class="dismiss_but" data-cy="dismiss_banner">
                <fa icon="times"></fa>
            </button>
        </template>
    </v-banner>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class UrlBanner extends Vue {
    dismiss() {
        //@ts-ignore
        this.$refs.banner.toggle()
    }
}
</script>
<style scoped lang="scss">
.url_banner {
    background-color: #ee2354 !important;
    color: #fff;
    z-index: 3 !important;
    font-size: 14px;

    .dismiss_but {
        margin-right: 8px;
        float: right;
    }
}
</style>
