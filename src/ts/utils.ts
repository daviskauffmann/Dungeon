import { game } from "./game";
import { ActorContext, StairContext, StairDirection } from "./types";

export function findActor(id: number) {
    for (const chunks of game.world.chunks) {
        for (const chunk of chunks) {
            for (const actor of chunk.actors) {
                if (actor.id === id) {
                    return { chunk, actor } as ActorContext;
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    for (const actor of level.actors) {
                        if (actor.id === id) {
                            return { chunk, dungeon, actor, level } as ActorContext;
                        }
                    }
                }
            }
        }
    }
}

export function findStair(id: number, direction: StairDirection) {
    for (const chunks of game.world.chunks) {
        for (const chunk of chunks) {
            if (direction === StairDirection.Down) {
                for (const stair of chunk.stairsDown) {
                    if (stair.id === id) {
                        return { chunk, stair } as StairContext;
                    }
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    if (direction === StairDirection.Down) {
                        if (level.stairDown.id === id) {
                            const stair = level.stairDown;

                            return { chunk, dungeon, level, stair } as StairContext;
                        }
                    } else if (direction === StairDirection.Up) {
                        if (level.stairUp.id === id) {
                            const stair = level.stairUp;

                            return { chunk, dungeon, level, stair } as StairContext;
                        }
                    }
                }
            }
        }
    }
}
