<template>
    <div class="menu-header">
        <slot></slot>
    </div>
</template>

<script lang="tsx">
import Vue from 'vue'
export default Vue.extend()
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.menu-header {
    display: flex;
    flex-direction: column;
    justify-content: center;

    font-family: 'Colony Wars', 'Play', sans-serif;
    height: 100%;

    border-bottom-right-radius: 25px 50%;
    padding: 0 8px;

    color: $color-background;
    background-color: $color-primary;
}
</style>