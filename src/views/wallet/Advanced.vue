<template>
    <div class="advance">
        <div>
            <h1>{{ $t('advanced.title') }}</h1>
        </div>
        <TokenListModal ref="token_list"></TokenListModal>
        <!--        <div class="buts grid_box">-->
        <!--            <button @click="openTokenlist">Manage Token Lists</button>-->
        <!--        </div>-->
        <div class="grids">
            <ChainImport class="grid_box"></ChainImport>
            <SignMessage class="grid_box"></SignMessage>
            <VerifyMessage class="grid_box"></VerifyMessage>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import ChainImport from '@/components/wallet/advanced/ChainImport.vue'
import SignMessage from '@/components/wallet/advanced/SignMessage/SignMessage.vue'
import VerifyMessage from '@/components/wallet/advanced/VerifyMessage.vue'
import TokenListModal from '@/components/modals/TokenList/TokenListModal.vue'

@Component({
    name: 'advanced',
    components: {
        TokenListModal,
        ChainImport,
        SignMessage,
        VerifyMessage,
    },
})
export default class Advanced extends Vue {
    $refs!: {
        token_list: TokenListModal
    }
    openTokenlist() {
        this.$refs.token_list.open()
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.advance {
    background-color: #f8f9fa !important;
    box-shadow: none !important;
}
h1 {
    font-weight: normal;
}
.grids {
    display: grid;
    column-gap: 14px;
    row-gap: 14px;
    grid-template-columns: repeat(3, 1fr);
}

.grid_box {
    background: white;
    padding: 30px;
    border-radius: 12px;
    overflow: auto;
    box-shadow: 0px 4px 16px rgba(20, 92, 143, 0.08);
}

@include main.mobile-device {
    .grids {
        grid-template-columns: none;
    }
}

@include main.medium-device {
    .grids {
        grid-template-columns: none;
    }
}

.buts {
    margin-bottom: 12px;
    button {
        color: var(--primary-color);
        &:hover {
            color: var(--secondary-color);
        }
    }
}
</style>
