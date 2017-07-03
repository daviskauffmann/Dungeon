/// <reference path="algorithms.ts" />
/// <reference path="dungeons.ts" />
/// <reference path="game.ts" />
/// <reference path="input.ts" />
/// <reference path="renderer.ts" />
/// <reference path="utilities.ts" />

interface Game {
    id: number;
    dungeons: Array<Dungeon>;
    turn: number;
    messages: Array<string>;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

interface Dungeon {
    width: number;
    height: number;
    cells: Array<Array<Cell>>;
    rooms: Array<Room>;
    entities: Array<Entity>;
    chests: Array<any>;
    items: Array<any>;
}

interface Cell {
    type: string;
    discovered: boolean;
}

interface Coord {
    x: number;
    y: number;
}

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Entity {
    id: number;
    x: number;
    y: number;
    name: string;
    char: string;
    level: number;
    stats: Stats;
    inventory: Array<Item>;
    factions: Array<string>;
    hostileFactions: Array<string>;
    hostileEntities: Array<number>;
}

interface Stats {
    level: number;

    health: number;
    energy: number;
    mana: number;

    stamina: number;
    endurance: number;
    attunement: number;
    resistance: number;
    strength: number;
    intellect: number;
    avoidance: number;
    precision: number;
    charisma: number;
    luck: number;

    sight: number;
}

interface Chest {
    x: number;
    y: number;
    char: string;
    loot: Item;
}

interface Item {
    x: number;
    y: number;
    name: string;
    char: string;
    index: string;
    equipped: boolean;
}

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

const canvas: any = document.getElementById('game');
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
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: {
        x: 0,
        y: 0
    }
}

// need to find a proper way to save the rng state when saving/loading
// Math.seedrandom();

draw();
window.addEventListener('resize', draw);
