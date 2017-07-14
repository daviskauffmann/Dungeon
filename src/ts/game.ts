import { fov } from './algorithms';
import { Dungeon } from './dungeon';
import { getDungeon, getEntity, tick as entity_tick } from './entity';
import { Coord } from './math';

export interface Game {
    currentId: number;
    dungeons: Array<Dungeon>;
    turn: number;
    messages: Array<string>;
    fontSize: number;
    cells: Array<any>;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

export interface UI {
    mode: string;
    maxMessages: number;
    inventorySwapFirst: number;
    inventorySwapSecond: number;
    target: Coord;
}

export let game: Game = {
    currentId: 0,
    dungeons: [],
    turn: 0,
    messages: [],
    fontSize: 24,
    cells: [
        { name: 'empty',        char: ' ', color: '#ffffff', solid: false },
        { name: 'floor',        char: '.', color: '#ffffff', solid: false },
        { name: 'grass',        char: '^', color: '#50ff50', solid: false },
        { name: 'wall',         char: '#', color: '#ffffff', solid: true  },
        { name: 'doorOpen',     char: '-', color: '#ffffff', solid: false },
        { name: 'doorClosed',   char: '+', color: '#ffffff', solid: true  },
        { name: 'stairsUp',     char: '<', color: '#ffffff', solid: false },
        { name: 'stairsDown',   char: '>', color: '#ffffff', solid: false }
    ],
    godMode: true,
    stopTime: false,
    ignoreFov: false
};

export const ui: UI = {
    mode: '',
    maxMessages: 10,
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: { x: 0, y: 0 }
};

export function tick() {
    if (!game.stopTime) {
        game.dungeons.forEach(dungeon => {
            dungeon.entities.forEach(entity => {
                if (entity.id !== 0) {
                    entity_tick(entity);
                }
            });
        });

        game.turn++;
    }
}

export function log(dungeon: Dungeon, location: Coord, message: string) {
    const player = getEntity(0);

    if (dungeon === getDungeon(player) &&
        fov(dungeon, { x: player.x, y: player.y }, player.sight, 1).find(coord => coord.x === location.x && coord.y === location.y)) {

        game.messages.push(message);

        if (game.messages.length > ui.maxMessages) {
            game.messages.shift();
        }
    }
}

export function save() {
    localStorage.setItem('game', JSON.stringify(game));
    console.log(JSON.stringify(game));
}

export function load() {
    game = JSON.parse(localStorage.getItem('game'));
    console.log(game);
}
