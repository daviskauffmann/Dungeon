import { aStar, lineOfSight } from "./algorithms";
import { createLevel } from "./dungeon";
import { game, log } from "./game";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Area, CellInfo, CellType, Class, Coord, Corpse, Disposition, Dungeon, Entity, Item, Level, Stats } from "./types";

export function calcStats(entity: Entity) {
    const stats: Stats = {
        attunement: entity.level,
        avoidance: entity.level,
        charisma: entity.level,
        endurance: entity.level,
        energy: entity.level * 100,
        health: entity.level * 100,
        intellect: entity.level,
        luck: entity.level,
        mana: entity.level * 100,
        precision: entity.level,
        resistance: entity.level,
        stamina: entity.level,
        strength: entity.level,
    };

    return stats;
}

export function changeArea(entity: Entity, from: Area, to: Area, calcSpawnCoord: (newArea: Area) => Coord) {
    log(from, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${"levelNumber"}`);

    /*while (levelNumber >= dungeon.levels.length) {
        dungeon.levels.push(createLevel(50, 50, 20, 5, 15, false, false, 0.5, 3, 20, 5));
    }*/

    from.entities.splice(from.entities.indexOf(entity), 1);
    to.entities.push(entity);

    const spawn = calcSpawnCoord(to);
    entity.x = spawn.x;
    entity.y = spawn.y;
}

export function getArea(entity: Entity) {
    // tslint:disable-next-line:prefer-for-of
    for (let x = 0; x < game.chunks.length; x++) {
        // tslint:disable-next-line:prefer-for-of
        for (let y = 0; y < game.chunks[x].length; y++) {
            const chunk = game.chunks[x][y];

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.entities.length; i++) {
                if (chunk.entities[i] === entity) {
                    return chunk as Area;
                }
            }

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.dungeons.length; i++) {
                // tslint:disable-next-line:prefer-for-of
                for (let j = 0; j < chunk.dungeons[i].levels.length; j++) {
                    const level = chunk.dungeons[i].levels[j];

                    // tslint:disable-next-line:prefer-for-of
                    for (let k = 0; k < level.entities.length; k++) {
                        if (level.entities[k] === entity) {
                            return level as Area;
                        }
                    }
                }
            }
        }
    }
}

export function getEntity(id: number) {
    // tslint:disable-next-line:prefer-for-of
    for (let x = 0; x < game.chunks.length; x++) {
        // tslint:disable-next-line:prefer-for-of
        for (let y = 0; y < game.chunks[x].length; y++) {
            const chunk = game.chunks[x][y];

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.entities.length; i++) {
                if (chunk.entities[i].id === id) {
                    return chunk.entities[i];
                }
            }

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.dungeons.length; i++) {
                // tslint:disable-next-line:prefer-for-of
                for (let j = 0; j < chunk.dungeons[i].levels.length; j++) {
                    const level = chunk.dungeons[i].levels[j];

                    // tslint:disable-next-line:prefer-for-of
                    for (let k = 0; k < level.entities.length; k++) {
                        if (level.entities[k].id === id) {
                            return level.entities[i];
                        }
                    }
                }
            }
        }
    }
}

export function getInventoryChar(entity: Entity, item: Item) {
    return String.fromCharCode(97 + entity.inventory.indexOf(item));
}

export function move(entity: Entity, area: Area, coord: Coord) {
    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        const cell = area.cells[coord.x][coord.y];

        switch (cell.type) {
            case CellType.Wall:
                return;
            case CellType.DoorClosed:
                if (randomFloat(0, 1) < 0.5) {
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} opens the door`);

                    cell.type = CellType.DoorOpen;
                } else {
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} can"t open the door`);
                }

                return;
            case CellType.StairsUp:
                log(area, { x: entity.x, y: entity.y }, `${entity.name} ascends`);

                changeArea(entity, area, area, (newDungeon) => {
                    for (let x = 0; x < newDungeon.width; x++) {
                        for (let y = 0; y < newDungeon.height; y++) {
                            if (newDungeon.cells[x][y].type === CellType.StairsDown) {
                                return { x, y };
                            }
                        }
                    }
                });

                return;
            case CellType.StairsDown:
                log(area, { x: entity.x, y: entity.y }, `${entity.name} descends`);

                changeArea(entity, area, area, (newDungeon) => {
                    for (let x = 0; x < newDungeon.width; x++) {
                        for (let y = 0; y < newDungeon.height; y++) {
                            if (newDungeon.cells[x][y].type === CellType.StairsUp) {
                                return { x, y };
                            }
                        }
                    }
                });

                return;
        }

        if (area.entities.some((target, targetIndex) => {
            if (target !== entity
                && target.x === coord.x && target.y === coord.y) {
                if (target.factions.some((faction) => entity.hostileFactions.indexOf(faction) > -1)) {
                    if (randomFloat(0, 1) < 0.5) {
                        if (target.id === 0 && game.godMode) {
                            log(area, { x: entity.x, y: entity.y }, `${entity.name} cannot kill ${target.name}`);
                        } else {
                            log(area, { x: entity.x, y: entity.y }, `${entity.name} kills ${target.name}`);

                            if (target.inventory.length) {
                                log(area, { x: entity.x, y: entity.y }, `${target.name} drops a ${target.inventory.map((item) => item.name).join(", ")}`);

                                target.inventory.forEach((item, itemIndex) => {
                                    item.x = target.x;
                                    item.y = target.y;
                                    item.equipped = false;

                                    target.inventory.splice(itemIndex, 1);
                                    area.items.push(item);
                                });
                            }

                            const corpse: Corpse = {
                                ...target,
                                char: "%",
                                equipped: false,
                                name: target.name + " corpse",
                                originalChar: target.char,
                            };

                            area.entities.splice(targetIndex, 1);
                            area.items.push(corpse);
                        }
                    } else {
                        log(area, { x: entity.x, y: entity.y }, `${entity.name} misses ${target.name}`);
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
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} opens the chest`);

                    area.chests.splice(index, 1);

                    if (chest.loot) {
                        if (entity.inventory.length < 26) {
                            log(area, { x: entity.x, y: entity.y }, `${entity.name} loots a ${chest.loot.name}`);

                            entity.inventory.push(chest.loot);
                        } else {
                            log(area, { x: entity.x, y: entity.y }, `${entity.name}"s inventory is full`);
                        }
                    } else {
                        log(area, { x: entity.x, y: entity.y }, `${entity.name} sees nothing inside`);
                    }
                } else {
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} can"t open the chest`);
                }

                return true;
            }
        })) {
            return;
        }

        {
            const itemNames = area.items.filter((item) => item.x === coord.x && item.y === coord.y)
                .map((item) => item.name).join(", ");

            if (itemNames) {
                log(area, { x: entity.x, y: entity.y }, `${entity.name} sees ${itemNames}`);
            }
        }

        entity.x = coord.x;
        entity.y = coord.y;
    }
}

export function tick(entity: Entity, area: Area) {
    {
        const items = area.items.filter((item) => item.x === entity.x && item.y === entity.y
            && randomFloat(0, 1) < 0.5);

        if (items.length) {
            log(area, { x: entity.x, y: entity.y }, `${entity.name} picks up ${items.map((item) => item.name).join(", ")}`);

            items.forEach((item) => {
                area.items.splice(area.items.indexOf(item), 1);
                entity.inventory.push(item);
            });

            return;
        }
    }

    switch (entity.class) {
        case Class.Warrior:
            break;
        case Class.Shaman:
            if (randomFloat(0, 1) < 0.5) {
                const corpses = area.items.filter((item) => "originalChar" in item
                    && (item as Corpse).factions.every((faction) => entity.hostileFactions.indexOf(faction) === -1)
                    && lineOfSight(area, { x: entity.x, y: entity.y }, radiansBetween({ x: entity.x, y: entity.y }, { x: item.x, y: item.y }), entity.sight)
                        .some((coord) => coord.x === item.x && coord.y === item.y))
                    .map((item) => item as Corpse);

                if (corpses.length) {
                    const corpse = corpses[0];

                    if (randomFloat(0, 1) < 0.5) {
                        const newEntity: Entity = {
                            alpha: corpse.alpha,
                            char: corpse.originalChar,
                            class: corpse.class,
                            color: corpse.color,
                            disposition: corpse.disposition,
                            factions: corpse.factions,
                            hostileEntityIds: corpse.hostileEntityIds,
                            hostileFactions: corpse.hostileFactions,
                            id: corpse.id,
                            inventory: corpse.inventory,
                            level: corpse.level,
                            name: corpse.name.replace(" corpse", ""),
                            sight: corpse.sight,
                            x: corpse.x,
                            y: corpse.y,
                        };

                        log(area, { x: entity.x, y: entity.y }, `${entity.name} ressurects ${newEntity.name}`);

                        area.items.splice(area.items.indexOf(corpse), 1);
                        area.entities.push(newEntity);
                    } else {
                        log(area, { x: entity.x, y: entity.y }, `${entity.name} fails to ressurect ${corpse.name}`);
                    }

                    return;
                }
            }

            break;
    }

    switch (entity.disposition) {
        case Disposition.Passive:
            break;
        case Disposition.Aggressive:
            if (randomFloat(0, 1) < 0.5) {
                const targets = area.entities.filter((target) => target !== entity
                    && target.factions
                        .some((faction) => entity.hostileFactions.indexOf(faction) > -1)
                    && lineOfSight(area, { x: entity.x, y: entity.y }, radiansBetween({ x: entity.x, y: entity.y }, { x: target.x, y: target.y }), entity.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));

                if (targets.length) {
                    const target = targets[0];

                    log(area, { x: entity.x, y: entity.y }, `${entity.name} spots ${target.name}`);

                    const path = aStar(area, { x: entity.x, y: entity.y }, { x: target.x, y: target.y });

                    if (path && path.length) {
                        const next = path.pop();

                        move(entity, area, { x: next.x, y: next.y });

                        return;
                    }
                }
            }

            break;
        case Disposition.Cowardly:
            break;
    }

    if (entity.inventory.some((item, index) => {
        if (item.name.includes("corpse")
            && randomFloat(0, 1) < 0.5) {
            log(area, { x: entity.x, y: entity.y }, `${entity.name} drops a ${item.name}`);

            item.x = entity.x;
            item.y = entity.y;

            entity.inventory.splice(index, 1);
            area.items.push(item);

            return true;
        }
    })) {
        return;
    }

    const roll = randomFloat(0, 1);
    if (roll < 0.25) {
        move(entity, area, { x: entity.x, y: entity.y - 1 });
    } else if (roll < 0.5) {
        move(entity, area, { x: entity.x + 1, y: entity.y });
    } else if (roll < 0.75) {
        move(entity, area, { x: entity.x, y: entity.y + 1 });
    } else {
        move(entity, area, { x: entity.x - 1, y: entity.y });
    }
}
