import { aStar, lineOfSight } from './algorithms';
import { createDungeon } from './dungeon';
import { game, log } from './game';
import { radiansBetween, randomFloat, randomInt } from './math';
import { CellInfo, CellType, Class, Coord, Corpse, Disposition, Dungeon, Entity, Item, Stats } from './types';

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

export function changeLevel(dungeon: Dungeon, entity: Entity, level: number, calcSpawnCoord: (newDungeon: Dungeon) => Coord) {
    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${level}`);

    while (level >= game.dungeons.length) {
        game.dungeons.push(createDungeon(50, 50, 20, 5, 15, false, false, 0.5, 3, 20, 5));
    }

    const newDungeon = game.dungeons[level];

    dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);
    newDungeon.entities.push(entity);

    const spawn = calcSpawnCoord(newDungeon);
    entity.x = spawn.x;
    entity.y = spawn.y;
}

export function getDungeon(entity: Entity) {
    return game.dungeons.find((dungeon) => dungeon.entities.indexOf(entity) > -1);
}

export function getEntity(id: number) {
    return game.dungeons.find((dungeon) => dungeon.entities.some((entity) => entity.id === id))
        .entities.find((entity) => entity.id === id);
}

export function getInventoryChar(entity: Entity, item: Item) {
    return String.fromCharCode(97 + entity.inventory.indexOf(item));
}

export function getLevel(entity: Entity) {
    return game.dungeons.indexOf(getDungeon(entity));
}

export function move(dungeon: Dungeon, entity: Entity, coord: Coord) {
    if (coord.x >= 0 && coord.x < dungeon.width && coord.y >= 0 && coord.y < dungeon.height) {
        const cell = dungeon.cells[coord.x][coord.y];

        switch (cell.type) {
            case CellType.Wall:
                return;
            case CellType.DoorClosed:
                if (randomFloat(0, 1) < 0.5) {
                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} opens the door`);

                    cell.type = CellType.DoorOpen;
                } else {
                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} can't open the door`);
                }

                return;
            case CellType.StairsUp:
                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} ascends`);

                changeLevel(dungeon, entity, getLevel(entity) - 1, (newDungeon) => {
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
                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} descends`);

                changeLevel(dungeon, entity, getLevel(entity) + 1, (newDungeon) => {
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

        if (dungeon.entities.some((target, targetIndex) => {
            if (target !== entity
                && target.x === coord.x && target.y === coord.y) {
                if (target.factions.some((faction) => entity.hostileFactions.indexOf(faction) > -1)) {
                    if (randomFloat(0, 1) < 0.5) {
                        if (target.id === 0 && game.godMode) {
                            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} cannot kill ${target.name}`);
                        } else {
                            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} kills ${target.name}`);

                            if (target.inventory.length) {
                                log(dungeon, { x: entity.x, y: entity.y }, `${target.name} drops a ${target.inventory.map((item) => item.name).join(', ')}`);

                                target.inventory.forEach((item, itemIndex) => {
                                    item.x = target.x;
                                    item.y = target.y;
                                    item.equipped = false;

                                    target.inventory.splice(itemIndex, 1);
                                    dungeon.items.push(item);
                                });
                            }

                            const corpse: Corpse = {
                                ...target,
                                char: '%',
                                equipped: false,
                                name: target.name + ' corpse',
                                originalChar: target.char,
                            };

                            dungeon.entities.splice(targetIndex, 1);
                            dungeon.items.push(corpse);
                        }
                    } else {
                        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} misses ${target.name}`);
                    }
                }

                return true;
            }
        })) {
            return;
        }

        if (dungeon.chests.some((chest, index) => {
            if (chest.x === coord.x && chest.y === coord.y) {
                if (randomFloat(0, 1) < 0.5) {
                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} opens the chest`);

                    dungeon.chests.splice(index, 1);

                    if (chest.loot) {
                        if (entity.inventory.length < 26) {
                            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} loots a ${chest.loot.name}`);

                            entity.inventory.push(chest.loot);
                        } else {
                            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name}'s inventory is full`);
                        }
                    } else {
                        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} sees nothing inside`);
                    }
                } else {
                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} can't open the chest`);
                }

                return true;
            }
        })) {
            return;
        }

        {
            const itemNames = dungeon.items.filter((item) => item.x === coord.x && item.y === coord.y)
                .map((item) => item.name).join(', ');

            if (itemNames) {
                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} sees ${itemNames}`);
            }
        }

        entity.x = coord.x;
        entity.y = coord.y;
    }
}

export function tick(dungeon: Dungeon, entity: Entity) {
    {
        const items = dungeon.items.filter((item) => item.x === entity.x && item.y === entity.y
            && randomFloat(0, 1) < 0.5);

        if (items.length) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} picks up ${items.map((item) => item.name).join(', ')}`);

            items.forEach((item) => {
                dungeon.items.splice(dungeon.items.indexOf(item), 1);
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
                const corpses = dungeon.items.filter((item) => 'originalChar' in item
                    && (item as Corpse).factions.every((faction) => entity.hostileFactions.indexOf(faction) === -1)
                    && lineOfSight(dungeon, { x: entity.x, y: entity.y }, radiansBetween({ x: entity.x, y: entity.y }, { x: item.x, y: item.y }), entity.sight)
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
                            name: corpse.name.replace(' corpse', ''),
                            sight: corpse.sight,
                            x: corpse.x,
                            y: corpse.y,
                        };

                        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} ressurects ${newEntity.name}`);

                        dungeon.items.splice(dungeon.items.indexOf(corpse), 1);
                        dungeon.entities.push(newEntity);
                    } else {
                        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} fails to ressurect ${corpse.name}`);
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
                const targets = dungeon.entities.filter((target) => target !== entity
                    && target.factions
                        .some((faction) => entity.hostileFactions.indexOf(faction) > -1)
                    && lineOfSight(dungeon, { x: entity.x, y: entity.y }, radiansBetween({ x: entity.x, y: entity.y }, { x: target.x, y: target.y }), entity.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));

                if (targets.length) {
                    const target = targets[0];

                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} spots ${target.name}`);

                    const path = aStar(dungeon, { x: entity.x, y: entity.y }, { x: target.x, y: target.y });

                    if (path && path.length) {
                        const next = path.pop();

                        move(dungeon, entity, { x: next.x, y: next.y });

                        return;
                    }
                }
            }

            break;
        case Disposition.Cowardly:
            break;
    }

    if (entity.inventory.some((item, index) => {
        if (item.name.includes('corpse')
            && randomFloat(0, 1) < 0.5) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} drops a ${item.name}`);

            item.x = entity.x;
            item.y = entity.y;

            entity.inventory.splice(index, 1);
            dungeon.items.push(item);

            return true;
        }
    })) {
        return;
    }

    const roll = randomFloat(0, 1);
    if (roll < 0.25) {
        move(dungeon, entity, { x: entity.x, y: entity.y - 1 });
    } else if (roll < 0.5) {
        move(dungeon, entity, { x: entity.x + 1, y: entity.y });
    } else if (roll < 0.75) {
        move(dungeon, entity, { x: entity.x, y: entity.y + 1 });
    } else {
        move(dungeon, entity, { x: entity.x - 1, y: entity.y });
    }
}
