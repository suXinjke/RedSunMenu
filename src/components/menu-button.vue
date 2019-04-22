<template>
    <div class="menu-button">
        <slot></slot>
    </div>
</template>

<style lang="scss">
@import '@/assets/variables.scss';

.menu-button {
    cursor: pointer;
    border-bottom-left-radius: 5% 50%;
    padding: 4px 16px;

    color: $color-font-primary;
    background-color: $color-secondary;

    &_selected, &:hover {
        color: $color-background;
        background-color: $color-primary;
    }

    &::selection {
        opacity: 0;
    }
}
</style>