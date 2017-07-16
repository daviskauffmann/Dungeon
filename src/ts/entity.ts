import { aStar, lineOfSight } from "./algorithms";
import { createLevel } from "./dungeon";
import { game, log } from "./game";
import { radiansBetween, randomFloat, randomInt } from "./math";
import { Area, CellInfo, CellType, Class, Context, Coord, Corpse, Disposition, Dungeon, Entity, Item, Level, Stats } from "./types";

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

export function getContext(entity: Entity): Context {
    // tslint:disable-next-line:prefer-for-of
    for (let x = 0; x < game.chunks.length; x++) {
        // tslint:disable-next-line:prefer-for-of
        for (let y = 0; y < game.chunks[x].length; y++) {
            const chunk = game.chunks[x][y];

            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < chunk.entities.length; i++) {
                if (chunk.entities[i] === entity) {
                    return { chunk };
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
                        if (level.entities[k] === entity) {
                            return { chunk, dungeon, level };
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
                            return level.entities[k];
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

export function move(entity: Entity, coord: Coord, context: Context) {
    const area = context.level || context.chunk;
    const dungeon = context.dungeon;

    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        const cell = area.cells[coord.x][coord.y];
        let levelIndex: number;

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

                levelIndex = dungeon.levels.indexOf(context.level) - 1;

                if (levelIndex === -1) {
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${levelIndex}`);

                    area.entities.splice(area.entities.indexOf(entity), 1);
                    context.chunk.entities.push(entity);

                    for (let x = 0; x < context.chunk.width; x++) {
                        for (let y = 0; y < context.chunk.height; y++) {
                            if (context.chunk.cells[x][y].type === CellType.StairsDown) {
                                entity.x = x;
                                entity.y = y;
                            }
                        }
                    }
                } else {
                    log(area, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${levelIndex}`);

                    area.entities.splice(area.entities.indexOf(entity), 1);
                    dungeon.levels[levelIndex].entities.push(entity);

                    for (let x = 0; x < dungeon.levels[levelIndex].width; x++) {
                        for (let y = 0; y < dungeon.levels[levelIndex].height; y++) {
                            if (dungeon.levels[levelIndex].cells[x][y].type === CellType.StairsDown) {
                                entity.x = x;
                                entity.y = y;
                            }
                        }
                    }
                }

                return;
            case CellType.StairsDown:
                log(area, { x: entity.x, y: entity.y }, `${entity.name} descends`);

                if (context.level) {
                    levelIndex = dungeon.levels.indexOf(context.level) + 1;

                    log(area, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${levelIndex}`);

                    while (levelIndex >= dungeon.levels.length) {
                        dungeon.levels.push(createLevel(50, 50, 20, 5, 15, false, false, 0.5, 3, 5, 5));
                    }

                    area.entities.splice(area.entities.indexOf(entity), 1);
                    dungeon.levels[levelIndex].entities.push(entity);

                    for (let x = 0; x < dungeon.levels[levelIndex].width; x++) {
                        for (let y = 0; y < dungeon.levels[levelIndex].height; y++) {
                            if (dungeon.levels[levelIndex].cells[x][y].type === CellType.StairsUp) {
                                entity.x = x;
                                entity.y = y;
                            }
                        }
                    }
                } else {
                    const newDungeon = context.chunk.dungeons[0];
                    levelIndex = 0;

                    log(area, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${levelIndex}`);

                    while (levelIndex >= newDungeon.levels.length) {
                        newDungeon.levels.push(createLevel(50, 50, 20, 5, 15, false, false, 0.5, 3, 5, 5));
                    }

                    area.entities.splice(area.entities.indexOf(entity), 1);
                    newDungeon.levels[levelIndex].entities.push(entity);

                    for (let x = 0; x < newDungeon.levels[levelIndex].width; x++) {
                        for (let y = 0; y < newDungeon.levels[levelIndex].height; y++) {
                            if (newDungeon.levels[levelIndex].cells[x][y].type === CellType.StairsUp) {
                                entity.x = x;
                                entity.y = y;
                            }
                        }
                    }
                }

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

export function tick(entity: Entity, context: Context) {
    const area = context.level || context.chunk;

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

                        move(entity, { x: next.x, y: next.y }, context);

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
        move(entity, { x: entity.x, y: entity.y - 1 }, context);
    } else if (roll < 0.5) {
        move(entity, { x: entity.x + 1, y: entity.y }, context);
    } else if (roll < 0.75) {
        move(entity, { x: entity.x, y: entity.y + 1 }, context);
    } else {
        move(entity, { x: entity.x - 1, y: entity.y }, context);
    }
}
