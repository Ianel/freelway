/* ==========================================================================
   CONFIG — constantes et paramètres du jeu (tunable, pas de logique).
   ========================================================================== */
const CFG = {
    world: {
        width: 2400,
        height: 1800,
        tileSize: 32,
        pathWidth: 38,
        grass: '#7bc043',
        grassDark: '#5aa02f',
        grassLight: '#a6e06a',
        path: '#e0c088',
        pathDark: '#c9a76a',
        water: '#4fb6e8',
        waterDark: '#2f8fc4',
        stone: '#b9b3a8',
        tree: '#228b22',
        house: '#deb887',
        bridge: '#8b4513'
    },
    player: {
        speed: 156,
        size: 28,
        interactionRange: 64,
        bodyColor: '#2f6fd0',
        skinColor: '#ffcc99'
    },
    camera: {
        lerp: 0.12
    },
    audio: {
        enabled: true,
        masterVolume: 0.35
    },
    storageKey: 'freelance_route_save_v1'
};