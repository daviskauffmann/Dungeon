import { tick as actor_tick } from "./actors";
import { game } from "./game";
import { ActorContext, Area, Chunk, Coord, StairContext, StairDirection } from "./types";

export function findActor(id: number) {
    for (const chunk of getChunkArray()) {
        for (const actor of chunk.actors) {
            if (actor.id === id) {
                return Object.freeze<ActorContext>({ chunk, actor });
            }
        }

        for (const dungeon of chunk.dungeons) {
            for (const level of dungeon.levels) {
                for (const actor of level.actors) {
                    if (actor.id === id) {
                        return Object.freeze<ActorContext>({ chunk, dungeon, level, actor });
                    }
                }
            }
        }
    }
}

export function findStair(id: number, direction: StairDirection) {
    for (const chunk of getChunkArray()) {
        if (direction === StairDirection.Down) {
            for (const stair of chunk.stairs) {
                if (stair.id === id) {
                    return Object.freeze<StairContext>({ chunk, stair });
                }
            }
        }

        for (const dungeon of chunk.dungeons) {
            for (const level of dungeon.levels) {
                if (direction === StairDirection.Down) {
                    if (level.stairDown.id === id) {
                        return Object.freeze<StairContext>({ chunk, dungeon, level, stair: level.stairDown });
                    }
                } else if (direction === StairDirection.Up) {
                    if (level.stairUp.id === id) {
                        return Object.freeze<StairContext>({ chunk, dungeon, level, stair: level.stairUp });
                    }
                }
            }
        }
    }
}

export function getChunkArray() {
    return Object.keys(game.world.chunks).map((key) => game.world.chunks[key]);
}

export function tick() {
    if (!game.stopTime) {
        getChunkArray().forEach((chunk) => {
            chunk.actors.forEach((actor) => {
                if (actor.id !== 0) {
                    actor_tick(actor, chunk);
                }
            });

            chunk.dungeons.forEach((dungeon) => {
                dungeon.levels.forEach((level) => {
                    level.actors.forEach((actor) => {
                        if (actor.id !== 0) {
                            actor_tick(actor, chunk, dungeon, level);
                        }
                    });
                });
            });
        });

        game.world.turn++;
    }
}
