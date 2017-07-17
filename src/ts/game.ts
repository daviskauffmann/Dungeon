import { tick as actor_tick } from "./actors";
import { lineOfSight } from "./algorithms";
import { radiansBetween } from "./math";
import { ActorContext, Area, Config, Coord, Game, Level, UI, UIMode } from "./types";
import { findActor } from "./utils";

export const config: Config = {
    cellInfo: [
        { char: " ", color: "#ffffff", solid: false },
        { char: ".", color: "#ffffff", solid: false },
        { char: "^", color: "#50ff50", solid: false },
        { char: "#", color: "#ffffff", solid: true },
        { char: "-", color: "#ffffff", solid: false },
        { char: "+", color: "#ffffff", solid: true },
    ],
    stairInfo: [
        { char: ">", color: "#ffffff" },
        { char: "<", color: "#ffffff" },
    ],
};

export let game: Game = {
    currentEntityId: 1,
    fontSize: 24,
    godMode: true,
    ignoreFov: false,
    messages: [],
    stopTime: false,
    turn: 0,
    world: undefined,
};

export function load() {
    game = JSON.parse(localStorage.getItem("game"));
    console.log(game);
}

export function log(area: Area, location: Coord, message: string) {
    const playerContext = findActor(0);
    const player = playerContext.actor;

    if ((area === playerContext.level || area === playerContext.chunk)
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
        game.world.chunks.forEach((chunks) => {
            chunks.forEach((chunk) => {
                chunk.actors.forEach((actor) => {
                    if (actor.id !== 0) {
                        const actorContext: ActorContext = {
                            actor,
                            chunk,
                        };

                        actor_tick(actorContext);
                    }
                });

                chunk.dungeons.forEach((dungeon) => {
                    dungeon.levels.forEach((level) => {
                        level.actors.forEach((actor) => {
                            if (actor.id !== 0) {
                                const actorContext: ActorContext = {
                                    actor,
                                    chunk,
                                    dungeon,
                                    level,
                                };

                                actor_tick(actorContext);
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
