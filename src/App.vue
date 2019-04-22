<template>
<div v-show="menu_section != MenuSection.Intermission" :class="{ 'main-menu': true, 'main-menu_section': menu_section !== MenuSection.Loading }" >
    <div class="main-menu__panel-left">
        <Panel/>
    </div>
    <div :key="menu_section + '_header'" class="main-menu__header">
        <MenuHeader>{{ menu_header }}</MenuHeader>
    </div>
    <div :key="menu_section + '_content'" class="main-menu__content">
        <div v-if="menu_section === MenuSection.Loading" class="loading-section">
            <div class="loading-section__header">
                <div>{{ active_station.name }}</div>
                <MenuButton v-on:click.native="menu_section = MenuSection.ShipView">Welcome</MenuButton>
            </div>
            <ContentSection class="loading-section__picture-container">
                <img class="loading-section__picture" :src="active_station.url"/>
            </ContentSection>
            <div class="loading-section__description">
                <ContentSection class="content-section_text">
                    <div>Traversing warpspace to new system</div>
                    <div>Arrival imminent</div>
                    <div>Have a nice day</div>
                </ContentSection>
            </div>
        </div>
        <div v-else-if="menu_section === MenuSection.About" class="menu-section">
            <div class="menu-section__content">
                <div class="about-section">
                    <div class="about-section__container">
                        <img class="about-section__logo" src="red_sun.svg"/>
                        <div class="about-section__text">
                            <div>Colony Wars: Red Sun tribute by <a href="https://twitter.com/suxinjke">suXin</a></div>
                            <div>This was made to practice CSS and also try <a href="https://threejs.org/">three.js</a></div>
                            <div>Models ripped with <a href="https://github.com/suXinjke/RedSunRipper">RedSunRipper</a></div>
                            <div><a href="https://youtu.be/KOtGQ01P72U?t=3433">Watch the original menus in action</a></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="menu-section__buttons">
                <MenuButton v-on:click.native="ambient_play = !ambient_play; beep()">Ambient {{ ambient_play ? 'ON' : 'OFF' }}</MenuButton>
                <MenuButton v-on:click.native="texture_filtering = !texture_filtering; beep()">Texture filtering {{ texture_filtering ? 'ON' : 'OFF' }}</MenuButton>
                <MenuButton v-on:click.native="ticker_disabled = !ticker_disabled; beep()">Ticker {{ ticker_disabled ? 'OFF' : 'ON' }}</MenuButton>
                <MenuButton v-on:click.native="secrets = !secrets; beep()">Secrets {{ secrets ? 'ON' : 'OFF' }}</MenuButton>
                <MenuButton v-on:click.native="menu_section = MenuSection.ShipView">Back</MenuButton>
            </div>
        </div>
        <div v-else-if="menu_section === MenuSection.ShipView" class="menu-section">
            <div class="menu-section__content">
                <ShipViewer :ship="active_ship" :texture_filtering="texture_filtering"/>
            </div>

            <div class="menu-section__buttons">
                <MenuButton
                    :class="{ 'menu-button_selected': active_ship === ship }"
                    v-for="ship in ships" :key="ship.name"
                    v-on:click.native="
                        if ( active_ship !== ship ) {
                            beep()
                        }
                        active_ship = ship;
                    "
                >
                    {{ ship.name_short || ship.name }}
                </MenuButton>
                <MenuButton v-on:click.native="menu_section = MenuSection.About">About</MenuButton>
            </div>
        </div>
    </div>
    <div class="main-menu__panel-right">
        <Panel/>
    </div>
    <div class="main-menu__panels-bottom">
        <Panel>
            <div></div>

            <div v-if="menu_section === MenuSection.Loading" class="panel__loading-bar-container">
                <LoadingBar :percent="loading_progress"/>
            </div>
            <div v-else class="panel__ticker-container">
                <Ticker :disabled="ticker_disabled"/>
            </div>
        </Panel>
    </div>
</div>
</template>

<script>
import 'normalize-css'
import MenuButton from '@/components/menu-button.vue'
import MenuHeader from '@/components/menu-header.vue'
import Panel from '@/components/panel.vue'
import ContentSection from '@/components/content-section.vue'
import Ticker from '@/components/ticker.vue'
import LoadingBar from '@/components/loading-bar.vue'
import ShipViewer from '@/ShipViewer.vue'

import { audio_ambient, audio_select, audio_select2 } from './audio'
import { loadShips, ships } from './ships'

const stations = [
    { name: 'Magenta Station', url: 'stations/magent.jpg' },
    { name: 'Marjorie Station', url: 'stations/marjorie.jpg' },
    { name: 'Aurora Station', url: 'stations/aurora.jpg' },
]

const MenuSection = {
    Loading: 'loading',
    Intermission: 'intermission',
    ShipView: 'ship_view',
    About: 'about'
}

export default {
    name: 'RedSun',
    components: {
        MenuButton,
        MenuHeader,
        Panel,
        ContentSection,
        Ticker,
        LoadingBar,
        ShipViewer,
    },

    data: () => ( {
        MenuSection,
        menu_section: MenuSection.Loading,

        active_station: stations[ Math.floor( Math.random() * Math.floor( stations.length ) ) ],
        active_ship: undefined,

        ambient_play: false,
        ticker_disabled: false,
        texture_filtering: true,
        secrets: false,
        loading_progress: 0
    } ),

    computed: {
        menu_header: function() {
            return (
                this.menu_section === MenuSection.Loading ? 'DESTINATION' :
                this.menu_section === MenuSection.ShipView ? 'SHIP VIEWER' :
                this.menu_section === MenuSection.About ? 'ABOUT' :
                'UNKNOWN'
            )
        },

        ships: function() {
            return ships.filter( ship => !ship.secret || ( ship.secret && this.secrets ) )
        }
    },

    methods: {
        async delay( msec = 1000 ) {
            return new Promise( res => setTimeout( res, msec ) )
        },

        beep() {
            audio_select2.currentTime = 0
            audio_select2.play()
        }
    },

    watch: {
        ambient_play: {
            handler: function( val ) {
                if ( val ) {
                    audio_ambient.play()
                } else {
                    audio_ambient.pause()
                    audio_ambient.currentTime = 0
                }
            },
            immediate: true
        },

        menu_section: function( val ) {
            if ( val === this.MenuSection.ShipView || val === this.MenuSection.About ) {
                audio_select.play()
            }
        },

        secrets: function( val ) {
            if ( !val && this.active_ship.secret ) {
                this.active_ship = this.ships[0]
            }
        }
    },

    async mounted() {
        await loadShips( progress => {
            this.loading_progress = progress * 100
        } )
        await this.delay( 1000 )
        this.active_ship = this.ships[0]

        await this.delay( 1000 )
        this.menu_section = this.MenuSection.Intermission
        await this.delay( 1000 )

        this.ambient_play = true
        this.menu_section = this.MenuSection.ShipView
    }
}
</script>

<style lang="scss">
@import '@/assets/variables.scss';

body {
    background-color: $color-background;
    color: $color-font-primary;

    font-family: 'Play', sans-serif;
    height: 100vh;
    padding: 28px 36px;
    box-sizing: border-box;

    min-width: 760px;
}

.menu-button-holder {
    display: flex;
    flex-direction: column;

    width: 400px;
    margin-left: 50px;

    .menu-button {
        margin-bottom: 4px;
    }
}

@keyframes main-menu__header_appear {
    0% { transform: translateX( -130% ); }
    100% { transform: translateX( 0% ); }
}

.main-menu {
    $side-panel-width: 48px;
    height: 100%;

    display: grid;
    grid-template-columns: $side-panel-width 1fr 250px $side-panel-width;
    grid-template-rows: 34px 1fr 48px;

    &__header {
        grid-area: 1 / 2 / 2 / 3;
        max-width: 430px;
        margin-left: -$corner-radius;
        padding-left: $spacing;

        background-color: $color-background;
    }

    &_section &__header {
        .menu-header {
            animation: main-menu__header_appear;
            animation-duration: $menu-controls-animation-duration;
        }
    }

    &__content {
        display: flex;
        .menu-section,
        .loading-section {
            flex: 1;
        }

        grid-area: 2 / 2 / 3 / 4;
        background-color: black;

        margin-right: -$corner-radius;
        margin-left: -$corner-radius;
        border-bottom-right-radius: $corner-radius;
        border-bottom-left-radius: $corner-radius;
        z-index: 2;
    }
    &__panel-left { grid-area: 1 / 1 / 3 / 2; }
    &__panel-right { grid-area: 2 / 4 / 3 / 5; }
    &__panels-bottom {
        grid-area: 3 / 1 / 4 / 5;

        .panel {
            display: flex;
            justify-content: space-between;
            align-items: center;

            border-bottom-left-radius: $corner-radius;
            border-bottom-right-radius: $corner-radius;

            &__ticker-container {
                width: 64px;
                height: 20px;
                margin-right: $side-panel-width;
            }

            &__loading-bar-container {
                width: 400px;
                margin-right: $side-panel-width * 1.5;
            }
        }
    }
}

@keyframes menu-section__buttons_appear {
    0% { transform: translateY( -25% ); }
    100% { transform: translateY( 0% ); }
}

@keyframes menu-section__buttons__menu_button_appear {
    0% { margin-bottom: -16px }
    100% { margin-bottom: $spacing; }
}

.menu-section {
    display: flex;

    &__content {
        flex: 1;
        margin: 0 $spacing;
    }

    &__buttons {
        flex-basis: 240px;
        margin-right: $spacing;

        .menu-button {
            margin-bottom: $spacing;

            animation: menu-section__buttons__menu_button_appear;
            animation-duration: $menu-controls-animation-duration;

            &:last-child {
                margin-top: $spacing * 4;
            }
        }

        animation: menu-section__buttons_appear;
        animation-duration: $menu-controls-animation-duration;
    }
}

.loading-section {
    display: flex;
    flex-direction: column;
    height: 100%;

    margin: 0 $spacing;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .menu-button {
            flex-basis: 240px;
        }

        margin-bottom: $spacing / 2;
    }

    &__picture-container {
        flex: 1;

        margin-bottom: $spacing;

        .content-section__content {
            position: relative;
        }
    }

    &__picture {
        width: 100%;
        height: 100%;

        position: absolute;
    }

    &__description {
        flex-basis: 100px;

        .content-section {
            height: 100%;

            border-bottom-left-radius: $corner-radius;
            border-bottom-right-radius: $corner-radius;
            &__content {
                border-bottom-left-radius: $corner-radius;
                border-bottom-right-radius: $corner-radius;
                margin-bottom: $spacing;
            }
        }
    }
}

.about-section {
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &__container {
        display: flex;
        align-items: flex-start;
    }
    &__logo {
        display: block;
        width: 48px;
        margin-right: $spacing;
    }
    &__text {
        flex: 1;
        color: $color-font-secondary;

        a {
            color: $color-font-primary;
            text-decoration: none;
        }
    }
}
</style>