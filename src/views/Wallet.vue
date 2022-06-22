<template>
    <div class="wallet_view" ref="wallet_view">
        <UpdateKeystoreModal v-if="isManageWarning"></UpdateKeystoreModal>
        <transition name="fade" mode="out-in">
            <sidebar class="panel sidenav"></sidebar>
        </transition>
        <div class="wallet_main">
            <div class="top_bar">
                <div class="search" :style="{ width: '80%' }">
                    <img src="@/assets/search.png" />
                    <input type="text" v-model="search" placeholder="Search" class="search-box" />
                </div>
                <div>Transactions</div>
                <network-menu class="net_menu"></network-menu>
            </div>
            <top-info class="wallet_top"></top-info>
            <transition name="page_fade" mode="out-in">
                <keep-alive
                    :exclude="['cross_chain', 'activity', 'advanced', 'earn', 'manage', 'studio']"
                >
                    <router-view id="wallet_router" :key="$route.path"></router-view>
                </keep-alive>
            </transition>
        </div>
        <!-- <transition name="fade" mode="out-in">
            <main-panel class="panel"></main-panel>
        </transition> -->
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import TopInfo from '@/components/wallet/TopInfo.vue'
import Sidebar from '@/components/wallet/Sidebar.vue'
import MainPanel from '@/components/SidePanels/MainPanel.vue'
import UpdateKeystoreModal from '@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue'
import NetworkMenu from '@/components/NetworkSettings/NetworkMenu.vue'

const TIMEOUT_DURATION = 60 * 7 // in seconds
const TIMEOUT_DUR_MS = TIMEOUT_DURATION * 1000

@Component({
    components: {
        Sidebar,
        MainPanel,
        TopInfo,
        UpdateKeystoreModal,
        NetworkMenu,
    },
})
export default class Wallet extends Vue {
    intervalId: NodeJS.Timeout | null = null
    logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
    isLogOut = false

    // Set the logout timestamp to now + TIMEOUT_DUR_MS
    resetTimer() {
        this.logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
    }

    checkLogout() {
        let now = Date.now()

        // Logout if current time is passed the logout timestamp
        if (now >= this.logoutTimestamp && !this.isLogOut) {
            this.isLogOut = true
            this.$store.dispatch('timeoutLogout')
        }
    }

    created() {
        this.resetTimer()
        this.intervalId = setInterval(() => {
            this.checkLogout()
        }, 1000)
    }

    unload(event: BeforeUnloadEvent) {
        // user has no wallet saved
        if (!localStorage.getItem('w') && this.hasVolatileWallets && this.isLogOut) {
            event.preventDefault()
            this.isLogOut = false
            event.returnValue = ''
            this.$router.push('/wallet/keys')
            this.resetTimer()
        }
    }

    mounted() {
        let view = this.$refs.wallet_view as HTMLDivElement

        view.addEventListener('mousemove', this.resetTimer)
        view.addEventListener('mousedown', this.resetTimer)

        window.addEventListener('beforeunload', this.unload)
    }

    beforeDestroy() {
        let view = this.$refs.wallet_view as HTMLDivElement
        // Remove Event Listeners
        view.removeEventListener('mousemove', this.resetTimer)
        view.removeEventListener('mousedown', this.resetTimer)
        window.removeEventListener('beforeunload', this.unload)
    }

    destroyed() {
        clearInterval(this.intervalId!)
    }

    get isManageWarning(): boolean {
        if (this.$store.state.warnUpdateKeyfile) {
            return true
        }
        return false
    }

    get hasVolatileWallets() {
        return this.$store.state.volatileWallets.length > 0
    }
}
</script>

<style lang="scss" scoped>
@use '../main';

.wallet_view {
    padding-bottom: 0;
    display: grid;
    grid-template-columns: 200px 1fr;
    column-gap: 15px;
    height: 100%;
    background: #f8f9fa;
}

.top_bar {
    display: flex;
    padding: 20px 0px;
}

.sidenav {
    background-color: var(--bg-wallet-light);
}

.search {
    height: 46px;
    padding: 5px;
    display: flex;
    align-items: center;
    font-size: 16px;
    flex-basis: 68%;
    flex-shrink: 1;
    border: 1.6px solid #e6e8ec;
    filter: drop-shadow(0px 8.1px 149.091px rgba(0, 0, 0, 0.04725));
    border-radius: 12px;
    margin-right: 20px;

    $icon_w: 36px;
    img {
        border-radius: 4px;
        padding: 10px 0px;
        /*height: 100%;*/
        height: $icon_w;
        width: $icon_w;
        object-fit: contain;
    }
    .search-box {
        //     padding: 5px;
        //     padding-left: 20px;
        width: 85%;
    }
}
.panel {
    overflow: auto;
    height: 100%;
    border-right: 1px solid #e6e8ec;
    background: #f8f9fa;
}

.wallet_main {
    height: 100%;
    padding: 5px 20px;
    display: grid;
    grid-template-rows: 45px max-content 1fr;
    grid-gap: 15px;
    padding-top: 8px;
}

#wallet_router {
    padding: 22px 20px;
    background: #ffffff;
    box-shadow: 0px 4px 16px rgba(20, 92, 143, 0.08);
    border-radius: 12px;
}

.page_fade-enter-active,
.page_fade-leave-active {
    transition: all 0.2s;
}
.page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
}

@include main.mobile-device {
    .wallet_view {
        display: block;
        column-gap: 9px;
    }
    .wallet_main {
        grid-gap: 9px;
        padding-top: 0;
    }

    .wallet_sidebar {
        display: none;
    }
}

@include main.medium-device {
    .wallet_view {
        grid-template-columns: 180px 1fr 240px !important;
        column-gap: 9px;
    }

    .wallet_main {
        grid-gap: 9px;
    }

    #wallet_router {
        padding: 12px 18px;
    }
}
</style>
