<template>
    <div class="panel">
        <slot></slot>
    </div>
</template>

<script lang="tsx">
import Vue from 'vue'
export default Vue.extend()
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.panel {
    width: 100%;
    height: 100%;
    background-color: $color-secondary;
}
</style>