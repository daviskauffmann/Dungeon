let game: Game = {
    id: 1,
    dungeons: [
        createTown()
    ],
    turn: 0,
    messages: [],
    godMode: true,
    stopTime: false,
    ignoreFov: false
}

const view: View = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    characterSize: 24,
    color: {
        default: '#fff'
    },
    cellType: {
        default: {
            color: '#ff0000',
            char: '/'
        },
        'empty': {
            char: ' '
        },
        'floor': {
            char: '.'
        },
        'grass': {
            color: '#50ff50',
            char: '^'
        },
        'wall': {
            char: '#'
        },
        'doorClosed': {
            char: '+'
        },
        'doorOpen': {
            char: '-'
        },
        'stairsDown': {
            char: '<'
        },
        'stairsUp': {
            char: '>'
        },
        'trap': {
            char: '^'
        }
    }
}

const ui: UI = {
    mode: '',
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: {
        x: 0,
        y: 0
    }
}
