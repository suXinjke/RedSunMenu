<template>
    <div class="content-section">
        <div class="content-section__content">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss">
@import '@/assets/variables.scss';

.content-section {
    background-color: $color-background;
    display: flex;

    &__content {
        flex: 1;

        border: 3px solid $color-border;
    }

    &_text &__content {
        padding: 8px;
        color: $color-font-secondary;
    }

    &__header {
        color: $color-font-primary;
    }
}
</style>



