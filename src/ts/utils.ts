import { game } from "./game";
import { ActorContext, StairContext, StairDirection } from "./types";

export function findActor(id: number) {
    for (const chunks of game.world.chunks) {
        for (const chunk of chunks) {
            for (const actor of chunk.actors) {
                if (actor.id === id) {
                    const actorContext: ActorContext = {
                        actor,
                        chunk,
                    };

                    return actorContext;
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    for (const actor of level.actors) {
                        if (actor.id === id) {
                            const actorContext: ActorContext = {
                                actor,
                                chunk,
                                dungeon,
                                level,
                            };

                            return actorContext;
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
                        const stairContext: StairContext = {
                            chunk,
                            stair,
                        };

                        return stairContext;
                    }
                }
            }

            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    if (direction === StairDirection.Down) {
                        if (level.stairDown.id === id) {
                            const stairContext: StairContext = {
                                chunk,
                                dungeon,
                                level,
                                stair: level.stairDown,
                            };

                            return stairContext;
                        }
                    } else if (direction === StairDirection.Up) {
                        if (level.stairUp.id === id) {
                            const stairContext: StairContext = {
                                chunk,
                                dungeon,
                                level,
                                stair: level.stairUp,
                            };

                            return stairContext;
                        }
                    }
                }
            }
        }
    }
}
