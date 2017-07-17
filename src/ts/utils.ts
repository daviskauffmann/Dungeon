import { game } from "./game";
import { EntityContext, StairContext, StairDirection } from "./types";

export function findEntity(id: number): EntityContext {
    // tslint:disable-next-line:prefer-for-of
    for (let x = 0; x < game.world.chunks.length; x++) {
        // tslint:disable-next-line:prefer-for-of
        for (let y = 0; y < game.world.chunks[x].length; y++) {
            const chunk = game.world.chunks[x][y];

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.entities.length; i++) {
                const entity = chunk.entities[i];

                if (entity.id === id) {
                    return { chunk, entity };
                }
            }

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.dungeons.length; i++) {
                const dungeon = chunk.dungeons[i];

                // tslint:disable-next-line:prefer-for-of
                for (let j = 0; j < dungeon.levels.length; j++) {
                    const level = dungeon.levels[j];

                    // tslint:disable-next-line:prefer-for-of
                    for (let k = 0; k < level.entities.length; k++) {
                        const entity = level.entities[k];

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
    // tslint:disable-next-line:prefer-for-of
    for (let x = 0; x < game.world.chunks.length; x++) {
        // tslint:disable-next-line:prefer-for-of
        for (let y = 0; y < game.world.chunks[x].length; y++) {
            const chunk = game.world.chunks[x][y];

            if (direction === StairDirection.Down) {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < chunk.stairsDown.length; i++) {
                    const stairs = chunk.stairsDown[i];

                    if (stairs.id === id) {
                        return { chunk, stairs };
                    }
                }
            }

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.dungeons.length; i++) {
                const dungeon = chunk.dungeons[i];

                // tslint:disable-next-line:prefer-for-of
                for (let j = 0; j < chunk.dungeons[i].levels.length; j++) {
                    const level = chunk.dungeons[i].levels[j];

                    if (direction === StairDirection.Down) {
                        if (level.stairDown.id === id) {
                            const stairs = level.stairDown;

                            return { chunk, dungeon, level, stairs };
                        }
                    } else if (direction === StairDirection.Up) {
                        if (level.stairUp.id === id) {
                            const stairs = level.stairUp;

                            return { chunk, dungeon, level, stairs };
                        }
                    }
                }
            }
        }
    }
}
