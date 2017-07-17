import { game } from "./game";
import { EntityContext, StairContext, StairDirection } from "./types";

export function findEntity(id: number): EntityContext {
    for (const chunks of game.world.chunks) {
        for (const chunk of chunks) {
            for (const entity of chunk.entities) {
                if (entity.id === id) {
                    return { chunk, entity };
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    for (const entity of level.entities) {
                        if (entity.id === id) {
                            return { chunk, dungeon, entity, level };
                        }
                    }
                }
            }
        }
    }
}

export function findStair(id: number, direction: StairDirection): StairContext {
    for (const chunks of game.world.chunks) {
        for (const chunk of chunks) {
            if (direction === StairDirection.Down) {
                for (const stair of chunk.stairsDown) {
                    if (stair.id === id) {
                        return { chunk, stair };
                    }
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    if (direction === StairDirection.Down) {
                        if (level.stairDown.id === id) {
                            const stair = level.stairDown;

                            return { chunk, dungeon, level, stair };
                        }
                    } else if (direction === StairDirection.Up) {
                        if (level.stairUp.id === id) {
                            const stair = level.stairUp;

                            return { chunk, dungeon, level, stair };
                        }
                    }
                }
            }
        }
    }
}
