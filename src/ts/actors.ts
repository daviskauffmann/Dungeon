import { aStar, lineOfSight } from "./algorithms";
import { config, game, log } from "./game";
import { createDungeon, createLevel } from "./generators";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Actor, Area, CellInfo, CellType, Chest, Chunk, Class, Context, Coord, Corpse, Disposition, Dungeon, Item, ItemType, Level, Stair, StairDirection, Stats } from "./types";
import { findStair } from "./utils";

export function ascend(actor: Actor, stair: Stair, area: Area) {
    log(area, actor, `${actor.name} ascends`);

    const stairContext = findStair(stair.id, StairDirection.Down);
    const newArea = stairContext.level || stairContext.chunk;

    moveToArea(actor, area, newArea, stairContext.stair);
}

export function attack(actor: Actor, target: Actor, area: Area) {
    const actorInfo = config.actorInfo[actor.actorType];
    const targetInfo = config.actorInfo[target.actorType];

    if (randomFloat(0, 1) < 0.5) {
        if (target.id === 0 && game.godMode) {
            log(area, actor, `${actor.name} cannot kill ${target.name}`);
        } else {
            log(area, actor, `${actor.name} kills ${target.name}`);

            target.inventory.forEach((item) => {
                dropItem(target, item, area);
            });

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

    if (!target.hostileActorIds.some((id) => id === actor.id)) {
        log(area, actor, `${actor.name} is now hostile to ${target.name}`);

        target.hostileActorIds.push(actor.id);
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

export function descend(actor: Actor, stair: Stair, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
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

export function dropItem(actor: Actor, item: Item, area: Area) {
    log(area, actor, `${actor.name} drops a ${item.name}`);

    item.x = actor.x;
    item.y = actor.y;
    item.equipped = false;

    actor.inventory.splice(actor.inventory.indexOf(item), 1);
    area.items.push(item);
}

export function getInventoryChar(actor: Actor, item: Item) {
    return String.fromCharCode(97 + actor.inventory.indexOf(item));
}

export function moveToCell(actor: Actor, coord: Coord, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const actorInfo = config.actorInfo[actor.actorType];
    const area: Area = level || chunk;

    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        {
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
        }

        if (area.actors.some((target) => {
            if (target !== actor
                && target.x === coord.x && target.y === coord.y) {
                if (config.actorInfo[target.actorType].factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                    || actor.hostileActorIds.some((id) => id === target.id)) {
                    attack(actor, target, area);
                }

                return true;
            }
        })) {
            return;
        }

        if (area.chests.some((chest) => {
            if (chest.x === coord.x && chest.y === coord.y) {
                openChest(actor, chest, area);

                return true;
            }
        })) {
            return;
        }

        if (level) {
            if (level.stairDown
                && level.stairDown.x === coord.x && level.stairDown.y === coord.y) {
                descend(actor, level.stairDown, chunk, dungeon, level);

                return;
            }
            if (level.stairUp.x === coord.x && level.stairUp.y === coord.y) {
                ascend(actor, level.stairUp, area);

                return;
            }
        } else {
            if (chunk.stairsDown.some((stairDown) => {
                if (stairDown.x === coord.x && stairDown.y === coord.y) {
                    descend(actor, stairDown, chunk, dungeon, level);

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

export function moveToArea(actor: Actor, area: Area, newArea: Area, newCoord: Coord) {
    area.actors.splice(area.actors.indexOf(actor), 1);
    newArea.actors.push(actor);

    actor.x = newCoord.x;
    actor.y = newCoord.y;
}

export function openChest(actor: Actor, chest: Chest, area: Area) {
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

export function pathfind(actor: Actor, coord: Coord, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const area: Area = level || chunk;

    const path = aStar(area, actor, coord);

    if (path && path.length) {
        moveToCell(actor, path.pop(), chunk, dungeon, level);

        return true;
    }
}

export function pickUpItem(actor: Actor, item: Item, area: Area) {
    log(area, actor, `${actor.name} picks up ${item.name}`);

    item.x = undefined;
    item.y = undefined;

    area.items.splice(area.items.indexOf(item), 1);
    actor.inventory.push(item);
}

export function resurrect(actor: Actor, corpse: Corpse, area: Area) {
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

export function tick(actor: Actor, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const actorInfo = config.actorInfo[actor.actorType];
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
                        resurrect(actor, corpses[0], area);
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
                    && (config.actorInfo[target.actorType].factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                        || actor.hostileActorIds.some((id) => id === target.id))
                    && lineOfSight(area, actor, radiansBetween(actor, target), actorInfo.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));

                if (targets.length) {
                    log(area, actor, `${actor.name} spots ${targets[0].name}`);

                    if (pathfind(actor, targets[0], chunk, dungeon, level)) {
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

            if (pathfind(actor, targets[0], chunk, dungeon, level)) {
                return;
            }
        }
    }

    if (randomFloat(0, 1) < 0.5 && area.items.some((item) => {
        if (item.x === actor.x && item.y === actor.y) {
            pickUpItem(actor, item, area);

            return true;
        }
    })) {
        return;
    }

    if (randomFloat(0, 1) < 0.5 && actor.inventory.some((item) => {
        if (item.name.includes("corpse")) {
            dropItem(actor, item, area);

            return true;
        }
    })) {
        return;
    }

    if (randomFloat(0, 1) < 0.5) {
        const roll = randomFloat(0, 1);
        if (roll < 0.25) {
            moveToCell(actor, { x: actor.x, y: actor.y - 1 }, chunk, dungeon, level);
        } else if (roll < 0.5) {
            moveToCell(actor, { x: actor.x + 1, y: actor.y }, chunk, dungeon, level);
        } else if (roll < 0.75) {
            moveToCell(actor, { x: actor.x, y: actor.y + 1 }, chunk, dungeon, level);
        } else {
            moveToCell(actor, { x: actor.x - 1, y: actor.y }, chunk, dungeon, level);
        }
    }
}
