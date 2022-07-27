<template>
    <div class="radio_buts">
        <button
            v-for="(key, i) in keys"
            :key="key"
            @click="select(key)"
            :active="selection === key"
            class="hover_border"
        >
            {{ labels[i] }}
        </button>
        <!-- <select @input="onChangeSource" class="select-core">
            <option value="all">All</option>
            <option value="transfer">Transfer</option>
            <option value="swap">Export & Import</option>
            <option value="stake">Validation & Nomination</option>
        </select> -->
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator'

@Component
export default class RadioButtons extends Vue {
    @Prop() labels!: string[]
    @Prop() keys!: string[]

    @Model('change', { type: String }) readonly selection!: string

    select(val: string) {
        this.$emit('change', val)
    }

    onChangeSource(ev: any) {
        let val = ev.target.value
        this.$emit('change', val)
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.radio_buts {
    display: flex;
    flex-wrap: wrap;
}
.select-core {
    background: url('../../assets/dropdownicon.svg') no-repeat right;
    padding: 10px;
    border: 2px solid #edeef5;
    border-radius: 12px;
}
button {
    word-break: normal;
    white-space: nowrap;
    font-weight: bold;
    font-size: 14px;
    padding: 4px 14px;
    border: 1px solid transparent;
    color: var(--primary-color-light);
    background-color: none;
    border-radius: 4px;
    margin-right: 6px;
    margin-bottom: 6px;
    transition-duration: 0.2s;
    font-family: Inconsolata, monospace;

    //&:hover {
    //    border-color: var(--bg-light);
    //}

    &[active] {
        background: #178fe1;
        margin: 2px;
        border-radius: 20px;
        padding: 5px 15px;
        color: #fff;
    }
}

button:hover {
    border: none;
}

@include main.medium-device {
    button {
        font-size: 11px;
        padding: 4px 8px;
    }
}
</style>
