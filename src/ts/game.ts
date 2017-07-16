import { lineOfSight } from "./algorithms";
import { findEntity, tick as entity_tick } from "./entity";
import { radiansBetween } from "./math";
import { Area, Coord, Game, Level, UI, UIMode } from "./types";

export let game: Game = {
    cellInfo: [
        { name: "empty", char: " ", color: "#ffffff", solid: false },
        { name: "floor", char: ".", color: "#ffffff", solid: false },
        { name: "grass", char: "^", color: "#50ff50", solid: false },
        { name: "wall", char: "#", color: "#ffffff", solid: true },
        { name: "doorOpen", char: "-", color: "#ffffff", solid: false },
        { name: "doorClosed", char: "+", color: "#ffffff", solid: true },
    ],
    chunks: [
        [],
    ],
    currentEntityId: 0,
    currentStairId: 0,
    fontSize: 24,
    godMode: true,
    ignoreFov: false,
    messages: [],
    stopTime: false,
    turn: 0,
};

export function load() {
    game = JSON.parse(localStorage.getItem("game"));
    console.log(game);
}

export function log(area: Area, location: Coord, message: string) {
    const context = findEntity(0);
    const player = context.entity;

    if ((area === context.level || area === context.chunk)
        && lineOfSight(area, { x: player.x, y: player.y }, radiansBetween({ x: player.x, y: player.y }, location), player.sight)
            .find((coord) => coord.x === location.x && coord.y === location.y)) {
        game.messages.push(message);

        if (game.messages.length > ui.maxMessages) {
            game.messages.shift();
        }
    }
}

export function save() {
    localStorage.setItem("game", JSON.stringify(game));
    console.log(JSON.stringify(game));
}

export function tick() {
    if (!game.stopTime) {
        game.chunks.forEach((col) => {
            col.forEach((chunk) => {
                chunk.entities.forEach((entity) => {
                    if (entity.id !== 0) {
                        entity_tick({ chunk, entity });
                    }
                });

                chunk.dungeons.forEach((dungeon) => {
                    dungeon.levels.forEach((level) => {
                        level.entities.forEach((entity) => {
                            if (entity.id !== 0) {
                                entity_tick({ chunk, dungeon, entity, level });
                            }
                        });
                    });
                });
            });
        });

        game.turn++;
    }
}

export const ui: UI = {
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    maxMessages: 10,
    mode: UIMode.Default,
    target: { x: 0, y: 0 },
};
