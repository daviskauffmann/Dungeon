/// <reference path="algorithms.js" />
/// <reference path="dungeons.js" />
/// <reference path="game.js" />
/// <reference path="input.js" />
/// <reference path="renderer.js" />
/// <reference path="utilities.js" />

let game = {
    id: 1,
    dungeons: [],
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
    characterSize: 24
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

game.dungeons.push(createTown());

draw();
window.addEventListener('resize', draw);
