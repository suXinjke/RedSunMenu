<template>
    <div :class="{ ticker: true, 'ticker_disabled': disabled }">
        <div class="ticker__tick"></div>
        <div class="ticker__tick"></div>
        <div class="ticker__tick"></div>
        <div class="ticker__tick"></div>
        <div class="ticker__tick"></div>
        <div class="ticker__tick"></div>
    </div>
</template>

<script>
export default {
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
}
</script>

<style lang="scss">
@import '@/assets/variables.scss';

@keyframes ticker__animation {
    0% { background-color: rgb( 188, 60, 20 ); }
    6.976% { background-color: rgb( 94, 30, 10 ); }
    13.953% { background-color: rgb( 47, 15, 5 ); }
    20.930% { background-color: black; }
    100% { background-color: black; }
}

.ticker {
    display: flex;
    width: 100%;
    height: 100%;

    &__tick {

        flex: 1;
        &:not(:last-child) {
            margin-right: 4px;
        }

        background-color: black;

        animation-name: ticker__animation;
        animation-duration: 2.15s;
        animation-iteration-count: infinite;
        animation-timing-function: steps( 1 );
        animation-fill-mode: backwards;

        @for $i from 1 through 6 {
            &:nth-child(#{$i}) {
                animation-delay: -#{0.15 * ( 6 - $i )}s
            }
        }
    }

    &_disabled &__tick {
        animation: none;
    }
}
</style>