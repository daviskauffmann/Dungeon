import { Dungeon } from './dungeon';
import { tick as entity_tick } from './entity';

export interface Game {
    currentId: number;
    dungeons: Array<Dungeon>;
    turn: number;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

export let game: Game = {
    currentId: 0,
    dungeons: [],
    turn: 0,
    godMode: true,
    stopTime: false,
    ignoreFov: false
}

export function tick() {
    if (game.stopTime) {
        return;
    }

    game.dungeons.forEach(dungeon => {
        dungeon.entities.forEach(entity => {
            if (entity.id === 0) {
                return;
            }

            entity_tick(entity);
        });
    });

    game.turn++;
}

export function save() {
    localStorage.setItem('game', JSON.stringify(game));
    console.log(JSON.stringify(game));
}

export function load() {
    game = JSON.parse(localStorage.getItem('game'));
    console.log(game);
}
