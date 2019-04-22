<template>
<div class="ship-viewer">
    <div class="ship-viewer__header">
        <div>{{ ship.name }}</div>
        <div>{{ ship.price }}</div>
    </div>
    <ContentSection class="ship-viewer__view">
        <div class="ship-viewer__model-container">
            <canvas class="ship-viewer__model" width="1024" height="768"></canvas>
        </div>
        <div class="ship-viewer__stats">
            <div class="ship-viewer__stats-attribute-section">
                <div class="ship-attribute">
                    <div class="ship-attribute__header">HL</div>
                    <div class="ship-attribute__bar">
                        <div v-for="n in 10" :key="n" :class="{ 'ship-attribute__chunk': true, 'ship-attribute__chunk_hull': n <= ship.hull }"></div>
                    </div>
                </div>
                <div class="ship-attribute">
                    <div class="ship-attribute__header">SH</div>
                    <div class="ship-attribute__bar">
                        <div v-for="n in 10" :key="n" :class="{ 'ship-attribute__chunk': true, 'ship-attribute__chunk_shield': n <= ship.shield }"></div>
                    </div>
                </div>
            </div>
            <div class="ship-viewer__stats-hardpoint-section">
                <div v-for="n in 8" :key="n" :class="{ 'ship-hardpoint': true, 'ship-hardpoint_active': n <= ship.hardpoints }"></div>
            </div>
            <div class="ship-viewer__stats-attribute-section">
                <div class="ship-attribute">
                    <div class="ship-attribute__bar">
                        <div v-for="n in 10" :key="n" :class="{ 'ship-attribute__chunk': true, 'ship-attribute__chunk_speed': 10 - n < ship.speed }"></div>
                    </div>
                    <div class="ship-attribute__header">SP</div>
                </div>
                <div class="ship-attribute">
                    <div class="ship-attribute__bar">
                        <div v-for="n in 10" :key="n" :class="{ 'ship-attribute__chunk': true, 'ship-attribute__chunk_heat': 10 - n < ship.heat }"></div>
                    </div>
                    <div class="ship-attribute__header">HT</div>
                </div>
            </div>
        </div>
    </ContentSection>
    <div class="ship-viewer__description">
        <ContentSection class="content-section_text">
            <span>
                <span class="content-section__header">{{ description_header }}</span>
                <template v-for="( line, index ) in description_lines">
                    <span :key="index"><br v-if="index <= description_lines.length"/>{{ line }}</span>
                </template>
                <span v-if="typewriter_active" :class="{ typewriter: true, 'content-section__header': typewriter_position <= ship.name.length }">▄</span>
            </span>
        </ContentSection>
    </div>
</div>
</template>

<script>
import ContentSection from '@/components/content-section.vue'
import { THREE } from './ships'

const TYPEWRITER_INTERVAL_MSEC = 30

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, 1024 / 768, 0.1, 2000 )
const light = new THREE.AmbientLight( 0xFFFFFF )
scene.add( light )

let renderCycle = undefined

export default {
    components: {
        ContentSection
    },

    data() {
        return {
            typewriter_position: 0,
            typewriter_timeout: undefined,

            renderer: undefined,

            lastCanvasWidth: 0,
            lastCanvasHeight: 0,

            rotation: 0
        }
    },

    props: {
        ship: {
            type: Object,
            required: true
        },

        texture_filtering: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        description_header: function() {
            return this.ship.name.slice( 0, this.typewriter_position )
        },
        description_lines: function() {
            let totalLength = this.description_header.length

            return this.ship.description.map( line => {
                const result = line.slice( 0, this.typewriter_position - totalLength )
                totalLength += result.length
                return result
            } ).filter( line => line )
        },
        typewriter_active: function() {
            return this.typewriter_position < ( this.ship.name + this.ship.description.join( '' ) ).length
        },
    },

    methods: {
        typewriterStep() {
            if ( !this.typewriter_active ) {
                return
            }

            this.typewriter_timeout = setTimeout( () => {
                this.typewriter_position++
                this.typewriterStep()
            }, TYPEWRITER_INTERVAL_MSEC )
        },

        updateAspectRatio() {
            const canvas = document.querySelector( '.ship-viewer__model-container' )
            if ( !canvas ) {
                return
            }

            const { clientWidth, clientHeight } = canvas

            if ( !camera ) {
                return
            }

            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
        },

        onResize: function() {
            this.updateAspectRatio()
        },

        draw() {
            renderCycle = requestAnimationFrame( this.draw )

            this.ship.model.rotation.x = 0.45
            this.ship.model.rotation.y = -this.rotation
            this.rotation += 0.01
            if ( this.rotation >= Math.PI * 2 ) {
                this.rotation = 0
            }

            this.renderer.render( scene, camera )
        },

        async init3D() {
            const canvas = document.querySelector( '.ship-viewer__model' )

            const renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } )
            this.renderer = renderer
            renderer.setSize( 800, 600, false )

            this.updateAspectRatio()
            this.draw()
        },

        // https://discourse.threejs.org/t/camera-zoom-to-fit-object/936
        fitCameraToObject( camera, object ) {

            // offset = offset || 1.25;
            const offset = 7

            const boundingBox = new THREE.Box3();

            // get bounding box of object - this will be used to setup controls and camera
            boundingBox.setFromObject( object );

            const center = boundingBox.getCenter();

            const size = boundingBox.getSize();

            // get the max side of the bounding box (fits to width OR height as needed )
            const maxDim = Math.max( size.x, size.y, size.z );
            const fov = camera.fov * ( Math.PI / 180 );
            let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

            cameraZ *= offset; // zoom out a little so that objects don't fill the screen

            camera.position.z = cameraZ;

            const minZ = boundingBox.min.z;
            const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

            camera.far = cameraToFarEdge * 3;
            camera.updateProjectionMatrix();

            camera.lookAt( center )
        }
    },

    watch: {
        ship: {
            immediate: true,
            handler: function( newShip, oldShip ) {
                if ( oldShip ) {
                    scene.remove( oldShip.model )
                }

                light.intensity = newShip.light_intensity || 2

                scene.add( newShip.model )
                scene.traverse( obj => {
                    if ( obj.material && obj.material.map ) {
                        obj.material.map.magFilter = this.texture_filtering ? THREE.LinearFilter : THREE.NearestFilter
                    }
                } )

                newShip.model.rotation.x = 0.45
                newShip.model.rotation.y = 0
                this.fitCameraToObject( camera, newShip.model )
                newShip.model.rotation.y = this.rotation

                if ( this.typewriter_timeout ) {
                    clearTimeout( this.typewriter_timeout )
                }
                this.typewriter_position = 0
                this.typewriterStep()
            }
        }
    },

    mounted() {
        this.init3D()
        window.addEventListener( 'resize', this.onResize )
    },

    beforeDestroy() {
        window.removeEventListener( 'resize', this.onResize )
        scene.remove( this.ship.model )
        this.renderer.dispose()

        cancelAnimationFrame( renderCycle )
    }
}
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.ship-viewer {
    height: 100%;

    display: flex;
    flex-direction: column;

    &__header {
        flex-basis: 25px;

        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        padding: $spacing $spacing + 2px $spacing 0;

        background-color: $color-background;
    }


    &__view {
        flex: 1;
        margin-bottom: $spacing;

        .content-section__content {
            display: flex;
            flex-direction: column;
            align-items: center;

            padding: 0 $spacing;
        }
    }

    &__model {
        height: 100%;
        width: 100%;
        background-color: red;
        position: absolute;
    }
    &__model-container {
        flex: 1;
        width: 100%;
        position: relative;
    }
    &__stats {
        flex-basis: 40px;

        display: flex;

        width: 420px;
    }
    &__stats-attribute-section {
        flex: 2;
    }
    &__stats-hardpoint-section {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        justify-items: center;
        margin: 0 $spacing;

        .ship-hardpoint {
            height: 16px;
            width: 16px;
        }
    }

    &__description {
        flex-basis: 104px;

        .content-section {
            height: 100%;

            border-bottom-left-radius: $corner-radius;
            &__content {
                border-bottom-left-radius: $corner-radius;
                margin-bottom: $spacing;
            }
        }
    }

}

.ship-attribute {
    $color-attribute-inactive: rgb( 0, 0, 58 );
    $color-attribute-hull: rgb( 66, 9, 24 );
    $color-attribute-shield: rgb( 37, 68, 22 );
    $color-attribute-speed: rgb( 49, 12, 73 );
    $color-attribute-heat: rgb( 76, 32, 19 );

    display: flex;
    align-items: center;

    &__header {
        flex-basis: 24px;
    }

    &__bar {
        display: flex;

        flex: 1;
        height: 16px;

        border: 1px solid $color-attribute-inactive;
    }

    &__chunk {
        flex: 1;
        background-color: $color-attribute-inactive;
        margin: 2px;

        &_hull {
            background-color: $color-attribute-hull;
        }
        &_shield {
            background-color: $color-attribute-shield;
        }
        &_speed {
            background-color: $color-attribute-speed;
        }
        &_heat {
            background-color: $color-attribute-heat;
        }
    }
}

.ship-hardpoint {
    height: 100%;
    width: 100%;

    border-radius: 100% 100%;
    background-color: $color-secondary;

    &_active {
        background-color: $color-primary;
    }
}

@keyframes typewriter__flicker {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
.typewriter {
    animation: typewriter__flicker;
    animation-duration: 0.1s;
    animation-iteration-count: infinite;
}
</style>