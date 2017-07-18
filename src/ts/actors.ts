import { aStar, lineOfSight } from "./algorithms";
import { game, log } from "./game";
import { createDungeon, createLevel } from "./generators";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Actor, ActorContext, Area, CellInfo, CellType, Chunk, Class, Coord, Corpse, Disposition, Dungeon, Item, Level, StairDirection, Stats } from "./types";
import { findStair } from "./utils";

export function calcStats(actor: Actor) {
    const stats: Stats = {
        armor: actor.level,
        attunement: actor.level,
        avoidance: actor.level,
        charisma: actor.level,
        encumbrance: actor.level,
        endurance: actor.level,
        energy: actor.level,
        health: actor.level,
        intellect: actor.level,
        luck: actor.level,
        mana: actor.level,
        precision: actor.level,
        resistance: actor.level,
        stamina: actor.level,
        strength: actor.level,
    };

    return stats;
}

export function getInventoryChar(actor: Actor, item: Item) {
    return String.fromCharCode(97 + actor.inventory.indexOf(item));
}

export function move(actorContext: ActorContext, coord: Coord) {
    const actor = actorContext.actor;
    const chunk = actorContext.chunk;
    const dungeon = actorContext.dungeon;
    const level = actorContext.level;
    const area: Area = level || chunk;

    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        const cell = area.cells[coord.x][coord.y];

        switch (cell.type) {
            case CellType.Wall:
                return;
            case CellType.DoorClosed:
                if (randomFloat(0, 1) < 0.5) {
                    log(area, { x: actor.x, y: actor.y }, `${actor.name} opens the door`);

                    cell.type = CellType.DoorOpen;
                } else {
                    log(area, { x: actor.x, y: actor.y }, `${actor.name} can't open the door`);
                }

                return;
        }

        if (area.actors.some((target, targetIndex) => {
            if (target !== actor
                && target.x === coord.x && target.y === coord.y) {
                if (target.factions.some((faction) => actor.hostileFactions.indexOf(faction) > -1)) {
                    if (randomFloat(0, 1) < 0.5) {
                        if (target.id === 0 && game.godMode) {
                            log(area, { x: actor.x, y: actor.y }, `${actor.name} cannot kill ${target.name}`);
                        } else {
                            log(area, { x: actor.x, y: actor.y }, `${actor.name} kills ${target.name}`);

                            if (target.inventory.length) {
                                log(area, { x: actor.x, y: actor.y }, `${target.name} drops a ${target.inventory.map((item) => item.name).join(", ")}`);

                                target.inventory.forEach((item, itemIndex) => {
                                    item.x = target.x;
                                    item.y = target.y;
                                    item.equipped = false;

                                    target.inventory.splice(itemIndex, 1);
                                    area.items.push(item);
                                });
                            }

                            area.actors.splice(targetIndex, 1);
                            area.items.push({
                                ...target,
                                char: "%",
                                equipped: false,
                                name: target.name + " corpse",
                                originalChar: target.char,
                            } as Corpse);
                        }
                    } else {
                        log(area, { x: actor.x, y: actor.y }, `${actor.name} misses ${target.name}`);
                    }
                }

                return true;
            }
        })) {
            return;
        }

        if (area.chests.some((chest, index) => {
            if (chest.x === coord.x && chest.y === coord.y) {
                if (randomFloat(0, 1) < 0.5) {
                    log(area, { x: actor.x, y: actor.y }, `${actor.name} opens the chest`);

                    area.chests.splice(index, 1);

                    if (chest.loot) {
                        if (actor.inventory.length < 26) {
                            log(area, { x: actor.x, y: actor.y }, `${actor.name} loots a ${chest.loot.name}`);

                            actor.inventory.push(chest.loot);
                        } else {
                            log(area, { x: actor.x, y: actor.y }, `${actor.name}'s inventory is full`);
                        }
                    } else {
                        log(area, { x: actor.x, y: actor.y }, `${actor.name} sees nothing inside`);
                    }
                } else {
                    log(area, { x: actor.x, y: actor.y }, `${actor.name} can't open the chest`);
                }

                return true;
            }
        })) {
            return;
        }

        if (level) {
            if (level.stairDown
                && level.stairDown.x === coord.x && level.stairDown.y === coord.y) {
                log(area, { x: actor.x, y: actor.y }, `${actor.name} descends`);

                const stairContext = findStair(level.stairDown.id, StairDirection.Up);

                if (stairContext) {
                    const newLevel = stairContext.level;

                    area.actors.splice(area.actors.indexOf(actor), 1);
                    newLevel.actors.push(actor);

                    actor.x = newLevel.stairUp.x;
                    actor.y = newLevel.stairUp.y;
                } else {
                    const newLevel = createLevel(level.stairDown.id, dungeon.levels.length >= dungeon.maxLevels);
                    dungeon.levels.push(newLevel);

                    area.actors.splice(area.actors.indexOf(actor), 1);
                    newLevel.actors.push(actor);

                    actor.x = newLevel.stairUp.x;
                    actor.y = newLevel.stairUp.y;
                }

                return;
            }
            if (level.stairUp.x === coord.x && level.stairUp.y === coord.y) {
                log(area, { x: actor.x, y: actor.y }, `${actor.name} ascends`);

                const stairContext = findStair(level.stairUp.id, StairDirection.Down);
                const newLevel = stairContext.level || stairContext.chunk;

                area.actors.splice(area.actors.indexOf(actor), 1);
                newLevel.actors.push(actor);

                actor.x = stairContext.stair.x;
                actor.y = stairContext.stair.y;

                return;
            }
        } else {
            if (chunk.stairsDown.some((stairDown) => {
                if (stairDown.x === coord.x && stairDown.y === coord.y) {
                    log(area, { x: actor.x, y: actor.y }, `${actor.name} descends`);

                    const stairContext = findStair(stairDown.id, StairDirection.Up);

                    if (stairContext) {
                        const newLevel = stairContext.level;

                        area.actors.splice(area.actors.indexOf(actor), 1);
                        newLevel.actors.push(actor);

                        actor.x = newLevel.stairUp.x;
                        actor.y = newLevel.stairUp.y;
                    } else {
                        const newDungeon = createDungeon();
                        chunk.dungeons.push(newDungeon);

                        const newLevel = createLevel(stairDown.id, newDungeon.levels.length >= newDungeon.maxLevels);
                        newDungeon.levels.push(newLevel);

                        area.actors.splice(area.actors.indexOf(actor), 1);
                        newLevel.actors.push(actor);

                        actor.x = newLevel.stairUp.x;
                        actor.y = newLevel.stairUp.y;
                    }

                    return true;
                }
            })) {
                return;
            }
        }

        {
            const itemNames = area.items.filter((item) => item.x === coord.x && item.y === coord.y)
                .map((item) => item.name).join(", ");

            if (itemNames) {
                log(area, { x: actor.x, y: actor.y }, `${actor.name} sees ${itemNames}`);
            }
        }

        actor.x = coord.x;
        actor.y = coord.y;
    }
}

export function tick(actorContext: ActorContext) {
    const actor = actorContext.actor;
    const chunk = actorContext.chunk;
    const dungeon = actorContext.dungeon;
    const level = actorContext.level;
    const area: Area = level || chunk;

    switch (actor.class) {
        case Class.Warrior:
            break;
        case Class.Shaman:
            if (randomFloat(0, 1) < 0.5) {
                const corpses = area.items.filter((item) => "originalChar" in item
                    && (item as Corpse).factions.every((faction) => actor.hostileFactions.indexOf(faction) === -1)
                    && lineOfSight(area, { x: actor.x, y: actor.y }, radiansBetween({ x: actor.x, y: actor.y }, { x: item.x, y: item.y }), actor.sight)
                        .some((coord) => coord.x === item.x && coord.y === item.y))
                    .map((item) => item as Corpse);

                if (corpses.length) {
                    const corpse = corpses[0];

                    if (randomFloat(0, 1) < 0.5) {
                        const newActor: Actor = {
                            alpha: corpse.alpha,
                            char: corpse.originalChar,
                            class: corpse.class,
                            color: corpse.color,
                            disposition: corpse.disposition,
                            factions: corpse.factions,
                            hostileActorIds: corpse.hostileActorIds,
                            hostileFactions: corpse.hostileFactions,
                            id: corpse.id,
                            inventory: corpse.inventory,
                            level: corpse.level,
                            name: corpse.name.replace(" corpse", ""),
                            sight: corpse.sight,
                            x: corpse.x,
                            y: corpse.y,
                        };

                        log(area, { x: actor.x, y: actor.y }, `${actor.name} ressurects ${newActor.name}`);

                        area.items.splice(area.items.indexOf(corpse), 1);
                        area.actors.push(newActor);
                    } else {
                        log(area, { x: actor.x, y: actor.y }, `${actor.name} fails to ressurect ${corpse.name}`);
                    }

                    return;
                }
            }

            break;
    }

    switch (actor.disposition) {
        case Disposition.Passive:
            break;
        case Disposition.Aggressive:
            if (randomFloat(0, 1) < 0.5) {
                const targets: Actor[] = area.actors.filter((target) => target !== actor
                    && target.factions
                        .some((faction) => actor.hostileFactions.indexOf(faction) > -1)
                    && lineOfSight(area, { x: actor.x, y: actor.y }, radiansBetween({ x: actor.x, y: actor.y }, { x: target.x, y: target.y }), actor.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));

                if (targets.length) {
                    const target = targets[0];

                    log(area, { x: actor.x, y: actor.y }, `${actor.name} spots ${target.name}`);

                    const path = aStar(area, { x: actor.x, y: actor.y }, { x: target.x, y: target.y });

                    if (path && path.length) {
                        const next = path.pop();

                        move(actorContext, { x: next.x, y: next.y });

                        return;
                    }
                }
            }

            break;
        case Disposition.Cowardly:
            break;
    }

    if (randomFloat(0, 1) < 0.5) {
        const targets: Array<{ x: number, y: number, name: string }> = area.chests.filter((chest) =>
            lineOfSight(area, { x: actor.x, y: actor.y }, radiansBetween({ x: actor.x, y: actor.y }, { x: chest.x, y: chest.y }), actor.sight)
                .some((coord) => coord.x === chest.x && coord.y === chest.y))
            .map((chest) => ({ x: chest.x, y: chest.y, name: "chest" }))
            || area.items.filter((item) => !("originalChar" in item)
                && lineOfSight(area, { x: actor.x, y: actor.y }, radiansBetween({ x: actor.x, y: actor.y }, { x: item.x, y: item.y }), actor.sight)
                    .some((coord) => coord.x === item.x && coord.y === item.y));

        if (targets.length) {
            const target = targets[0];

            log(area, { x: actor.x, y: actor.y }, `${actor.name} spots ${target.name}`);

            const path = aStar(area, { x: actor.x, y: actor.y }, { x: target.x, y: target.y });

            if (path && path.length) {
                const next = path.pop();

                move(actorContext, { x: next.x, y: next.y });

                return;
            }
        }
    }

    if (randomFloat(0, 1) < 0.5 && area.items.some((item, index) => {
        if (item.x === actor.x && item.y === actor.y) {
            log(area, { x: actor.x, y: actor.y }, `${actor.name} picks up ${item.name}`);

            area.items.splice(index, 1);
            actor.inventory.push(item);

            return true;
        }
    })) {
        return;
    }

    if (randomFloat(0, 1) < 0.5 && actor.inventory.some((item, index) => {
        if (item.name.includes("corpse")) {
            log(area, { x: actor.x, y: actor.y }, `${actor.name} drops a ${item.name}`);

            item.x = actor.x;
            item.y = actor.y;

            actor.inventory.splice(index, 1);
            area.items.push(item);

            return true;
        }
    })) {
        return;
    }

    if (randomFloat(0, 1) < 0.5) {
        const roll = randomFloat(0, 1);
        if (roll < 0.25) {
            move(actorContext, { x: actor.x, y: actor.y - 1 });
        } else if (roll < 0.5) {
            move(actorContext, { x: actor.x + 1, y: actor.y });
        } else if (roll < 0.75) {
            move(actorContext, { x: actor.x, y: actor.y + 1 });
        } else {
            move(actorContext, { x: actor.x - 1, y: actor.y });
        }
    }
}
