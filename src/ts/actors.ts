import { aStar, lineOfSight } from "./algorithms";
import { config, game, log } from "./game";
import { createDungeon, createLevel } from "./generators";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Actor, Area, CellInfo, CellType, Chest, Chunk, Class, Context, Coord, Corpse, Disposition, Dungeon, Item, ItemType, Level, Stair, StairDirection, Stats } from "./types";
import { findStair } from "./utils";

export function ascend(actor: Actor, context: Context, stair: Stair) {
    const chunk = context.chunk;
    const level = context.level;
    const area: Area = level || chunk;

    log(area, actor, `${actor.name} ascends`);

    const stairContext = findStair(stair.id, StairDirection.Down);
    const newArea = stairContext.level || stairContext.chunk;

    moveToArea(actor, area, newArea, stairContext.stair);
}

export function attack(actor: Actor, context: Context, target: Actor) {
    const actorInfo = config.actorInfo[actor.actorType];
    const chunk = context.chunk;
    const dungeon = context.dungeon;
    const level = context.level;
    const area: Area = level || chunk;

    if (randomFloat(0, 1) < 0.5) {
        if (target.id === 0 && game.godMode) {
            log(area, actor, `${actor.name} cannot kill ${target.name}`);
        } else {
            log(area, actor, `${actor.name} kills ${target.name}`);

            if (target.inventory.length) {
                log(area, actor, `${target.name} drops a ${target.inventory.map((item) => item.name).join(", ")}`);

                target.inventory.forEach((item, index) => {
                    item.x = target.x;
                    item.y = target.y;
                    item.equipped = false;

                    target.inventory.splice(index, 1);
                    area.items.push(item);
                });
            }

            const corpse: Corpse = {
                ...target,
                equipped: false,
                itemType: ItemType.Corpse,
                name: target.name + " corpse",
            };

            area.actors.splice(area.actors.indexOf(target), 1);
            area.items.push(corpse);
        }
    } else {
        log(area, actor, `${actor.name} misses ${target.name}`);
    }
}

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

export function descend(actor: Actor, context: Context, stair: Stair) {
    const chunk = context.chunk;
    const dungeon = context.dungeon;
    const level = context.level;
    const area: Area = level || chunk;

    log(area, actor, `${actor.name} descends`);

    const stairContext = findStair(stair.id, StairDirection.Up);

    if (stairContext) {
        moveToArea(actor, area, stairContext.level, stairContext.level.stairUp);
    } else {
        let newDungeon;
        if (dungeon) {
            newDungeon = dungeon;
        } else {
            newDungeon = createDungeon();
            chunk.dungeons.push(newDungeon);
        }

        const newLevel = createLevel(stair.id);
        newDungeon.levels.push(newLevel);

        moveToArea(actor, area, newLevel, newLevel.stairUp);
    }
}

export function getInventoryChar(actor: Actor, item: Item) {
    return String.fromCharCode(97 + actor.inventory.indexOf(item));
}

export function moveToCell(actor: Actor, context: Context, coord: Coord) {
    const actorInfo = config.actorInfo[actor.actorType];
    const chunk = context.chunk;
    const dungeon = context.dungeon;
    const level = context.level;
    const area: Area = level || chunk;

    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        const cell = area.cells[coord.x][coord.y];

        switch (cell.type) {
            case CellType.Wall:
                return;
            case CellType.DoorClosed:
                if (randomFloat(0, 1) < 0.5) {
                    log(area, actor, `${actor.name} opens the door`);

                    cell.type = CellType.DoorOpen;
                } else {
                    log(area, actor, `${actor.name} can't open the door`);
                }

                return;
        }

        if (area.actors.some((target) => {
            if (target !== actor
                && target.x === coord.x && target.y === coord.y) {
                if (config.actorInfo[target.actorType].factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)) {
                    attack(actor, context, target);
                }

                return true;
            }
        })) {
            return;
        }

        if (area.chests.some((chest) => {
            if (chest.x === coord.x && chest.y === coord.y) {
                openChest(actor, context, chest);

                return true;
            }
        })) {
            return;
        }

        if (level) {
            if (level.stairDown
                && level.stairDown.x === coord.x && level.stairDown.y === coord.y) {
                descend(actor, context, level.stairDown);

                return;
            }
            if (level.stairUp.x === coord.x && level.stairUp.y === coord.y) {
                ascend(actor, context, level.stairUp);

                return;
            }
        } else {
            if (chunk.stairsDown.some((stairDown) => {
                if (stairDown.x === coord.x && stairDown.y === coord.y) {
                    descend(actor, context, stairDown);

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
                log(area, actor, `${actor.name} sees ${itemNames}`);
            }
        }

        actor.x = coord.x;
        actor.y = coord.y;
    }
}

export function moveToArea(actor: Actor, area: Area, newArea: Area, coord: Coord) {
    area.actors.splice(area.actors.indexOf(actor), 1);
    newArea.actors.push(actor);

    actor.x = coord.x;
    actor.y = coord.y;
}

export function openChest(actor: Actor, context: Context, chest: Chest) {
    const chunk = context.chunk;
    const level = context.level;
    const area: Area = level || chunk;

    if (randomFloat(0, 1) < 0.5) {
        log(area, actor, `${actor.name} opens the chest`);

        area.chests.splice(area.chests.indexOf(chest), 1);

        if (chest.loot) {
            if (actor.inventory.length < 26) {
                log(area, actor, `${actor.name} loots a ${chest.loot.name}`);

                actor.inventory.push(chest.loot);
            } else {
                log(area, actor, `${actor.name}'s inventory is full`);
            }
        } else {
            log(area, actor, `${actor.name} sees nothing inside`);
        }
    } else {
        log(area, actor, `${actor.name} can't open the chest`);
    }
}

export function pathfind(actor: Actor, context: Context, coord: Coord) {
    const chunk = context.chunk;
    const level = context.level;
    const area: Area = level || chunk;

    const path = aStar(area, actor, coord);

    if (path && path.length) {
        moveToCell(actor, context, path.pop());

        return true;
    }
}

export function resurrect(actor: Actor, context: Context, corpse: Corpse) {
    const chunk = context.chunk;
    const level = context.level;
    const area: Area = level || chunk;

    const newActor: Actor = {
        actorType: corpse.actorType,
        class: corpse.class,
        experience: corpse.experience,
        hostileActorIds: corpse.hostileActorIds,
        id: corpse.id,
        inventory: corpse.inventory,
        level: corpse.level,
        name: corpse.name.replace(" corpse", ""),
        x: corpse.x,
        y: corpse.y,
    };

    log(area, actor, `${actor.name} ressurects ${newActor.name}`);

    area.items.splice(area.items.indexOf(corpse), 1);
    area.actors.push(newActor);
}

export function tick(actor: Actor, context: Context) {
    const actorInfo = config.actorInfo[actor.actorType];
    const chunk = context.chunk;
    const dungeon = context.dungeon;
    const level = context.level;
    const area: Area = level || chunk;

    switch (actor.class) {
        case Class.Warrior:
            break;
        case Class.Shaman:
            if (randomFloat(0, 1) < 0.5) {
                const corpses = area.items.filter((item) => "id" in item
                    && config.actorInfo[(item as Corpse).actorType].factions.every((faction) => actorInfo.hostileFactions.indexOf(faction) === -1)
                    && lineOfSight(area, actor, radiansBetween(actor, item), actorInfo.sight)
                        .some((coord) => coord.x === item.x && coord.y === item.y))
                    .map((item) => item as Corpse);

                if (corpses.length) {
                    if (randomFloat(0, 1) < 0.5) {
                        resurrect(actor, context, corpses[0]);
                    } else {
                        log(area, actor, `${actor.name} fails to ressurect ${corpses[0].name}`);
                    }

                    return;
                }
            }

            break;
    }

    switch (actorInfo.disposition) {
        case Disposition.Passive:
            break;
        case Disposition.Aggressive:
            if (randomFloat(0, 1) < 0.5) {
                const targets: Actor[] = area.actors.filter((target) => target !== actor
                    && config.actorInfo[target.actorType].factions
                        .some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                    && lineOfSight(area, actor, radiansBetween(actor, target), actorInfo.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));

                if (targets.length) {
                    log(area, actor, `${actor.name} spots ${targets[0].name}`);

                    if (pathfind(actor, context, targets[0])) {
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
            lineOfSight(area, actor, radiansBetween(actor, chest), actorInfo.sight)
                .some((coord) => coord.x === chest.x && coord.y === chest.y))
            .map((chest) => ({ x: chest.x, y: chest.y, name: "chest" }))
            || area.items.filter((item) => !("id" in item)
                && lineOfSight(area, actor, radiansBetween(actor, item), actorInfo.sight)
                    .some((coord) => coord.x === item.x && coord.y === item.y));

        if (targets.length) {
            log(area, actor, `${actor.name} spots ${targets[0].name}`);

            if (pathfind(actor, context, targets[0])) {
                return;
            }
        }
    }

    if (randomFloat(0, 1) < 0.5 && area.items.some((item, index) => {
        if (item.x === actor.x && item.y === actor.y) {
            log(area, actor, `${actor.name} picks up ${item.name}`);

            area.items.splice(index, 1);
            actor.inventory.push(item);

            return true;
        }
    })) {
        return;
    }

    if (randomFloat(0, 1) < 0.5 && actor.inventory.some((item, index) => {
        if (item.name.includes("corpse")) {
            log(area, actor, `${actor.name} drops a ${item.name}`);

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
            moveToCell(actor, context, { x: actor.x, y: actor.y - 1 });
        } else if (roll < 0.5) {
            moveToCell(actor, context, { x: actor.x + 1, y: actor.y });
        } else if (roll < 0.75) {
            moveToCell(actor, context, { x: actor.x, y: actor.y + 1 });
        } else {
            moveToCell(actor, context, { x: actor.x - 1, y: actor.y });
        }
    }
}
