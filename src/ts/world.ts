import { tick as actor_tick } from "./actors";
import { game } from "./game";
import { ActorContext, Area, Chunk, Coord, StairContext, StairDirection } from "./types";

export function findActor(id: number) {
    const actorContext: ActorContext = {
        actor: undefined,
        chunk: undefined,
        dungeon: undefined,
        level: undefined,
    };

    for (const chunk of getChunkArray()) {
        actorContext.chunk = chunk;

        for (const actor of chunk.actors) {
            actorContext.actor = actor;

            if (actor.id === id) {
                return actorContext;
            }
        }

        for (const dungeon of chunk.dungeons) {
            actorContext.dungeon = dungeon;

            for (const level of dungeon.levels) {
                actorContext.level = level;

                for (const actor of level.actors) {
                    actorContext.actor = actor;

                    if (actor.id === id) {
                        return actorContext;
                    }
                }
            }
        }
    }
}

export function findStair(id: number, direction: StairDirection) {
    const stairContext: StairContext = {
        chunk: undefined,
        dungeon: undefined,
        level: undefined,
        stair: undefined,
    };

    for (const chunk of getChunkArray()) {
        stairContext.chunk = chunk;

        if (direction === StairDirection.Down) {
            for (const stair of chunk.stairs) {
                stairContext.stair = stair;

                if (stair.id === id) {
                    return stairContext;
                }
            }
        }

        for (const dungeon of chunk.dungeons) {
            stairContext.dungeon = dungeon;

            for (const level of dungeon.levels) {
                stairContext.level = level;

                if (direction === StairDirection.Down) {
                    if (level.stairDown.id === id) {
                        stairContext.stair = level.stairDown;

                        return stairContext;
                    }
                } else if (direction === StairDirection.Up) {
                    if (level.stairUp.id === id) {
                        stairContext.stair = level.stairUp;

                        return stairContext;
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
