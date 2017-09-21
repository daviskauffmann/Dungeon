import { aStar, lineOfSight } from "./algorithms";
import { config, game, log } from "./game";
import { createChunk, createDungeon, createLevel } from "./generators";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Actor, ActorType, Area, Cell, CellType, Chest, Chunk, Class, Coord, Corpse, Disposition, Dungeon, Equipment, Item, ItemType, Level, Stair, StairDirection, Stats } from "./types";
import { checkBounds, findStair } from "./world";

export function ascend(actor: Actor, stair: Stair, area: Area) {
    log(area, actor, `${actor.name} ascends`);

    const stairContext = findStair(stair.id, StairDirection.Down);
    const newArea: Area = stairContext.level || stairContext.chunk;

    moveToArea(actor, area, newArea, stairContext.stair);
}

export function attack(actor: Actor, target: Actor, area: Area) {
    const actorInfo = config.actorInfo[ActorType[actor.actorType]];
    const targetInfo = config.actorInfo[ActorType[target.actorType]];

    const actorStats = calcStats(actor);
    const targetStats = calcStats(target);

    if (randomFloat(0, 1) < 0.5) { // chance to hit
        if (game.godMode && target.id === 0) {
            log(area, actor, `${actor.name} cannot damage ${target.name}`);
        } else {
            const damage = randomInt(0, 100);

            log(area, actor, `${actor.name} hits ${target.name} for ${damage}`);

            target.health -= damage;

            if (target.health <= 0) {
                log(area, actor, `${actor.name} kills ${target.name}`);

                target.inventory.forEach((item) => dropItem(target, item, area));

                const corpse: Corpse = {
                    ...target,
                    itemType: ItemType.Corpse,
                    name: target.name + " corpse",
                };

                area.actors.splice(area.actors.indexOf(target), 1);
                area.items.push(corpse);
            }
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
    return Object.freeze<Stats>({
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
    });
}

export function closeDoor(actor: Actor, cell: Cell, area: Area) {
    if (cell.type === CellType.DoorOpen) {
        log(area, actor, `${actor.name} closes the door`);

        cell.type = CellType.DoorClosed;
    }
}

export function descend(actor: Actor, stair: Stair, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const area: Area = level || chunk;

    log(area, actor, `${actor.name} descends`);

    const stairContext = findStair(stair.id, StairDirection.Up);

    const newLevel: Level = stairContext
        ? stairContext.level
        : createLevel(dungeon || createDungeon(chunk), stair.id);

    moveToArea(actor, area, newLevel, newLevel.stairUp);
}

export function dropItem(actor: Actor, item: Item, area: Area) {
    log(area, actor, `${actor.name} drops a ${item.name}`);

    item.x = actor.x;
    item.y = actor.y;

    if (item.itemType === ItemType.Equipment) {
        const equipment = item as Equipment;

        equipment.equipped = false;
    }

    actor.inventory.splice(actor.inventory.indexOf(item), 1);
    area.items.push(item);
}

export function getInventoryChar(actor: Actor, item: Item) {
    return String.fromCharCode(97 + actor.inventory.indexOf(item));
}

export function getInventoryIndex(char: string) {
    return char.charCodeAt(0) - 97;
}

export function moveToArea(actor: Actor, area: Area, newArea: Area, newCoord: Coord) {
    actor.x = newCoord.x;
    actor.y = newCoord.y;

    area.actors.splice(area.actors.indexOf(actor), 1);
    newArea.actors.push(actor);
}

export function moveToCell(actor: Actor, coord: Coord, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const actorInfo = config.actorInfo[ActorType[actor.actorType]];

    const area: Area = level || chunk;

    if (checkBounds(area, coord)) {
        {
            const cell = area.cells[coord.x][coord.y];
            const cellInfo = config.cellInfo[CellType[cell.type]];

            if (cell.type === CellType.DoorClosed) {
                openDoor(actor, cell, area);
            }

            if (cellInfo.solid) {
                return;
            }
        }

        {
            const other = area.actors.find((other) =>
                other !== actor
                && other.x === coord.x && other.y === coord.y);

            if (other) {
                const otherInfo = config.actorInfo[ActorType[other.actorType]];

                if (otherInfo.factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                    || actor.hostileActorIds.some((id) => id === other.id)) {
                    attack(actor, other, area);
                }

                return;
            }
        }

        {
            const chest = area.chests.find((chest) => chest.x === coord.x && chest.y === coord.y);

            if (chest) {
                openChest(actor, chest, area);

                return;
            }
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
            const stair = chunk.stairs.find((stair) => stair.x === coord.x && stair.y === coord.y);

            if (stair) {
                descend(actor, stair, chunk, dungeon, level);

                return;
            }
        }

        {
            const itemNames = area.items
                .filter((item) => item.x === coord.x && item.y === coord.y)
                .map((item) => item.name)
                .join(", ");

            if (itemNames) {
                log(area, actor, `${actor.name} sees ${itemNames}`);
            }
        }

        actor.x = coord.x;
        actor.y = coord.y;
    } else {
        if (!level) {
            const newChunkCoord: Coord = {
                x: coord.x < 0
                    ? chunk.x - 1
                    : coord.x >= area.width
                        ? chunk.x + 1
                        : chunk.x,
                y: coord.y < 0
                    ? chunk.y - 1
                    : coord.y >= area.height
                        ? chunk.y + 1
                        : chunk.y,
            };

            const newChunk = game.world.chunks[`${newChunkCoord.x},${newChunkCoord.y}`] || createChunk(newChunkCoord);

            const newCoord = {
                x: coord.x < 0
                    ? newChunk.width - 1
                    : coord.x >= area.width
                        ? 0
                        : actor.x,
                y: coord.y < 0
                    ? newChunk.height - 1
                    : coord.y >= area.height
                        ? 0
                        : actor.y,
            };

            moveToArea(actor, chunk, newChunk, newCoord);
        }
    }
}

export function openChest(actor: Actor, chest: Chest, area: Area) {
    if (randomFloat(0, 1) < 0.5) { // chance to open lock
        log(area, actor, `${actor.name} opens the chest`);

        area.chests.splice(area.chests.indexOf(chest), 1);

        if (chest.loot) {
            if (actor.inventory.length < 26) {
                log(area, actor, `${actor.name} loots a ${chest.loot.name} `);

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

export function openDoor(actor: Actor, cell: Cell, area: Area) {
    if (randomFloat(0, 1) < 0.5) { // chance to open lock
        log(area, actor, `${actor.name} opens the door`);

        cell.type = CellType.DoorOpen;
    } else {
        log(area, actor, `${actor.name} can't open the door`);
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
    if (randomFloat(0, 1) < 0.5) { // chance to resurrect
        const newActor: Actor = {
            actorType: corpse.actorType,
            class: corpse.class,
            energy: 1,
            experience: corpse.experience,
            health: 1,
            hostileActorIds: corpse.hostileActorIds,
            id: corpse.id,
            inventory: corpse.inventory,
            level: corpse.level,
            mana: 1,
            name: corpse.name.replace(" corpse", ""),
            x: corpse.x,
            y: corpse.y,
        };

        log(area, actor, `${actor.name} ressurects ${newActor.name}`);

        area.items.splice(area.items.indexOf(corpse), 1);
        area.actors.push(newActor);
    } else {
        log(area, actor, `${actor.name} fails to ressurect ${corpse.name}`);
    }
}

export function tick(actor: Actor, chunk: Chunk, dungeon?: Dungeon, level?: Level) {
    const actorInfo = config.actorInfo[ActorType[actor.actorType]];

    const area: Area = level || chunk;

    switch (actor.class) {
        case Class.Warrior: {
            break;
        }
        case Class.Shaman: {
            if (randomFloat(0, 1) < 0.5) { // decision to resurrect
                const corpse = area.items.find((item) => {
                    if (item.itemType === ItemType.Corpse) {
                        const corpse = item as Corpse;
                        const corpseInfo = config.actorInfo[ActorType[corpse.actorType]];

                        return corpseInfo.factions.every((faction) => actorInfo.hostileFactions.indexOf(faction) === -1)
                            && lineOfSight(area, actor, radiansBetween(actor, corpse), actorInfo.sight)
                                .some((coord) => coord.x === corpse.x && coord.y === corpse.y);
                    }
                }) as Corpse;

                if (corpse) {
                    resurrect(actor, corpse, area);

                    return;
                }
            }

            break;
        }
    }

    switch (actorInfo.disposition) {
        case Disposition.Passive: {
            break;
        }
        case Disposition.Aggressive: {
            if (randomFloat(0, 1) < 0.5) { // decision to look for targets
                const target = area.actors.find((other) => {
                    const otherInfo = config.actorInfo[ActorType[other.actorType]];

                    return other !== actor
                        && (otherInfo.factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                            || actor.hostileActorIds.some((id) => id === other.id))
                        && lineOfSight(area, actor, radiansBetween(actor, other), actorInfo.sight)
                            .some((coord) => coord.x === other.x && coord.y === other.y);
                });

                if (target) {
                    log(area, actor, `${actor.name} spots ${target.name}`);

                    if (pathfind(actor, target, chunk, dungeon, level)) {
                        return;
                    }
                }
            }

            break;
        }
        case Disposition.Cowardly: {
            break;
        }
    }

    if (randomFloat(0, 1) < 0.5) { // decision to look for chests
        const chest = area.chests.find((chest) =>
            lineOfSight(area, actor, radiansBetween(actor, chest), actorInfo.sight)
                .some((coord) => coord.x === chest.x && coord.y === chest.y));

        if (chest) {
            log(area, actor, `${actor.name} spots a chest`);

            if (pathfind(actor, chest, chunk, dungeon, level)) {
                return;
            }
        }
    }

    if (randomFloat(0, 1) < 0.5) { // decision to look for items
        const item = area.items.find((item) =>
            item.itemType !== ItemType.Corpse
            && lineOfSight(area, actor, radiansBetween(actor, item), actorInfo.sight)
                .some((coord) => coord.x === item.x && coord.y === item.y));

        if (item) {
            log(area, actor, `${actor.name} spots ${item.name}`);

            if (pathfind(actor, item, chunk, dungeon, level)) {
                return;
            }
        }
    }

    if (randomFloat(0, 1) < 0.5) { // decision to pick up item
        const item = area.items.find((item) => item.x === actor.x && item.y === actor.y);

        if (item) {
            pickUpItem(actor, item, area);

            return;
        }
    }

    if (randomFloat(0, 1) < 0.5) { // decision to discard corpses
        actor.inventory
            .filter((item) => item.itemType === ItemType.Corpse)
            .map((item) => item as Corpse)
            .forEach((corpse) => dropItem(actor, corpse, area));

        return;
    }

    if (randomFloat(0, 1) < 0.5) { // decision to move randomly
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

        return;
    }
}
