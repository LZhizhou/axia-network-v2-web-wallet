<template>
    <div>
        <div class="networks_list">
            <network-row
                data-cy="network-item"
                v-for="net in networks"
                :key="net.id"
                class="network_row"
                :network="net"
                @edit="onEdit(net)"
            ></network-row>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import NetworkRow from './NetworkRow.vue'
import { AxiaNetwork } from '@/js/AxiaNetwork'

@Component({
    components: {
        NetworkRow,
    },
})
export default class ListPage extends Vue {
    get networks(): AxiaNetwork[] {
        return this.$store.getters['Network/allNetworks']
    }

    onEdit(net: AxiaNetwork) {
        this.$emit('edit', net)
    }
}
</script>
<style scoped lang="scss">
.networks_list {
    padding: 0px 15px;
}
</style>
