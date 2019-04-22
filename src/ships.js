import * as three from 'three'
window.THREE = three
require( 'three/examples/js/loaders/GLTFLoader' )
const loader = new three.GLTFLoader()

export const THREE = three

export const ships = [
    {
        name: 'Magentech CR8 Snapdragon',
        name_short: 'CR8 Snapdragon',
        price: 'Cost: 0 CR',
        description: [
            'Scout Fighter',
            '"Empiret Naval Security surplus. Cheap, but better than nothing."'
        ],
        file: 'models/snapdragon.gltf',

        hull: 6,
        speed: 4,
        shield: 4,
        heat: 3,
        hardpoints: 4
    },
    {
        name: 'Zaibatsu Zu-7 Ryusei',
        name_short: 'Zaibatsu Zu-7 Ryusei',
        price: 'Cost: 38 000 CR',
        description: [
            'Light Fighter',
            '"Tried and tested for over 30 years. Think reliable, think Ryusei."'
        ],
        file: 'models/z_rusei.gltf',

        hull: 6,
        speed: 5,
        shield: 5,
        heat: 5,
        hardpoints: 5
    },
    {
        name: 'Zaibatsu Zu-15A Shinden',
        name_short: 'Zu-15A Shinden',
        price: 'Cost: 70 000 CR',
        description: [
            'Multi-role Fighter',
            '"Powerful and versatile, Zaibatsu deliver the best once again."'
        ],
        file: 'models/z_shinden.gltf',

        hull: 6,
        speed: 6,
        shield: 6,
        heat: 5,
        hardpoints: 6
    },
    {
        name: 'Harper-Jones H2S Cobra',
        name_short: 'H2S Cobra',
        price: 'Cost: 110 000 CR',
        description: [
            'Multi-role Fighter',
            '"All the lethality you need at a price you can afford."'
        ],
        file: 'models/hj_cobra.gltf',

        hull: 8,
        speed: 6,
        shield: 6,
        heat: 6,
        hardpoints: 6
    },
    {
        name: 'Harper-Jones H4E Magnum',
        name_short: 'H4E Magnum',
        price: 'Cost: 145 200 CR',
        description: [
            'Interceptor',
            '"The choice of the more discerning mercenary."'
        ],
        file: 'models/hj_magnum.gltf',

        hull: 8,
        speed: 6,
        shield: 6,
        heat: 7,
        hardpoints: 7
    },
    {
        name: 'Beth Skarn Industries 919 Medusa II',
        name_short: 'BSI 919 Medusa II',
        price: 'Cost: 192 500 CR',
        description: [
            'Interceptor',
            '"Want to do your enemy harm? Fight and win - Beth Skarn."'
        ],
        file: 'models/bsi_medusa.gltf',

        hull: 8,
        speed: 6,
        shield: 7,
        heat: 7,
        hardpoints: 7
    },
    {
        name: 'Beth Skarn Industries 303 Hyper Zeroid',
        name_short: 'BSI 303 Hyper Zeroid',
        price: 'Cost: 207 300 CR',
        description: [
            'Interceptor',
            '"A state-of-the-art killer. Beth Skarn always deliver."'
        ],
        file: 'models/bsi_zeroid.gltf',

        hull: 8,
        speed: 7,
        shield: 7,
        heat: 8,
        hardpoints: 8
    },
    {
        name: 'Sha\'Har Fighter',
        price: 'Cost: N/A',
        description: [
            'Light Strike Fighter',
            '"Fast. Deadly. Inhuman."',
        ],
        file: 'models/shahar.gltf',

        hull: 6,
        speed: 9,
        shield: 9,
        heat: 8,
        hardpoints: 4,

        light_intensity: 3
    },
    {
        name: 'Max Paynecopter',
        price: 'Cost: N/A',
        description: [
            'NY Undercover Agent',
            '"A helicopter with nothing to lose."',
            'Can be encountered in Half-Payne subspace',
        ],
        file: 'models/paynecopter.gltf',

        hull: 2,
        speed: 3,
        shield: 0,
        heat: 10,
        hardpoints: 1,

        secret: true,
        light_intensity: 5
    },
    {
        name: '🐸',
        price: 'Cost: N/A',
        description: [
            'Frog',
            '"It is known that [DATA EXPUNGED]"'
        ],
        file: 'models/frog.gltf',

        hull: 6,
        speed: 7,
        shield: 0,
        heat: 3,
        hardpoints: 2,

        secret: true
    },
]

async function loadGLTF( url, loadingCallback = () => {} ) {
    return new Promise( ( res, rej ) => {

        loader.load( url,
            function( obj ) {
                res( obj.scene )
            },
            function( xhr ) {
                loadingCallback( xhr )
            },
            function( err ) {
                rej( err )
            }
        )
    } )
}

export async function loadShips( loadingCallback = () => {} ) {
    const loadingProgresses = ships.map( () => 0 )

    const updateProgress = ( index, progress ) => {
        loadingProgresses[index] = progress

        const totalProgress = loadingProgresses.reduce( ( sum, val ) => sum + val, 0 ) / loadingProgresses.length
        loadingCallback( totalProgress )
    }

    const models = await Promise.all(
        ships.map( ( ship, index ) => loadGLTF( ship.file, ( xhr ) => {
            updateProgress( index, xhr.loaded / xhr.total )
        } ).then( obj => {
            updateProgress( index, 1 )
            return obj
        } ) )
    )

    models.forEach( ( model, index ) => {
        ships[index].model = model
    } )
}