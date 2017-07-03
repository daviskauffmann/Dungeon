/// <reference path="algorithms.js" />
/// <reference path="dungeons.js" />
/// <reference path="game.js" />
/// <reference path="input.js" />
/// <reference path="renderer.js" />
/// <reference path="utilities.js" />

let game = {
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

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const view = {
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

const ui = {
    mode: '',
    inventorySwapFirst: undefined,
    inventorySwapSecond: undefined,
    target: {
        x: 0,
        y: 0
    }
}

// need to find a proper way to save the rng state when saving/loading
Math.seedrandom();

draw();
window.addEventListener('resize', draw);
