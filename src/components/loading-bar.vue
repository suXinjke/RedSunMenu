<template>
    <div class="loading-bar">
        <div class="loading-bar__header">Loading</div>
        <div class="loading-bar__bar-container">
            <div class="loading-bar__bar" :style="{ width: `${percent}%` }"></div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        percent: {
            type: Number,
            default: 30
        }
    },
}
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.loading-bar {
    width: 100%;

    display: flex;

    &__header {
        margin-right: 16px;
    }

    &__bar-container {
        flex: 1;

        background-color: $color-background;
        padding: 3px;
    }

    &__bar {
        height: 100%;
        // width: 30%;
        background-color: $color-border;
    }
}
</style>