<template>
    <div>
        <button class="toggle_but" @click="toggleMenu">
            <p>Transactions</p>
        </button>
        <transition name="fade">
            <div class="network_dispose_bg" v-if="isActive" key="bg" @click="closeMenu"></div>
        </transition>
        <transition name="slide_right">
            <div class="network_body" v-show="isActive" key="body">
                <transaction-history-panel></transaction-history-panel>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import TransactionHistoryPanel from '@/components/SidePanels/TransactionHistoryPanel.vue'

@Component({
    components: {
        TransactionHistoryPanel,
    },
})
export default class TransactionHistorySidePanel extends Vue {
    isActive: boolean = false

    closeMenu(): void {
        this.isActive = false
    }

    toggleMenu(): void {
        this.isActive = !this.isActive
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.network_menu {
    position: relative;
}

.toggle_but {
    //border: 2px solid var(--bg-light);
    padding: 2px 10px;
    //font-size: 13px;
    display: flex;
    border-radius: 6px;
    position: relative;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: var(--bg-light);
    }

    $dotW: 8px;
    span {
        width: $dotW;
        height: $dotW;
        border-radius: $dotW;
        margin-right: 4px;
    }

    p {
        user-select: none;
    }

    button {
        outline: none !important;
    }

    img {
        max-height: 24px;
        object-fit: contain;
        margin-right: 5px;
    }

    &[testnet]:after {
        position: absolute;
        content: 'TEST';
        background-color: var(--secondary-color);
        color: #fff;
        font-size: 9px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 12px;
        right: -20px;
        top: -8px;
    }
}

.tab_cancel {
    color: var(--primary-color);
}

.secondary_button {
    color: #178fe1;
    background-color: none;
}

.network_dispose_bg {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
}

.network_body {
    position: fixed;
    z-index: 3;
    top: 0;
    right: 0;
    height: 100%;
    border: 1px solid var(--bg-light);
    border-radius: 4px;
    width: 340px;
    background-color: var(--bg);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.4);
}

.header {
    border-bottom: 1px solid var(--bg-light);
    padding: 10px 15px;
    display: flex;
    h4 {
        flex-grow: 1;
    }

    button {
        font-size: 12px;
        padding: 3px 14px;
        border-radius: 4px;
    }
}

.network_menu[connected] {
    .toggle_but {
        color: var(--primary-color);
    }
}

@media only screen and (max-width: main.$mobile_width) {
    .network_body {
        position: fixed;
        width: 100vw;
        z-index: 2;
        right: 0 !important;
        left: 0 !important;
    }
}

@include main.medium-device {
    .toggle_but {
        min-width: auto;
    }
}
</style>
