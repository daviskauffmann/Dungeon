import { astar, fov } from './algorithms';
import { CellType, Corpse, createDungeon, Dungeon, Item } from './dungeon';
import { game } from './game';
import { Coord, randomFloat, randomInt } from './math';
import { Glyph } from './renderer';
import { log } from './ui';

export interface Entity extends Coord, Glyph {
    id: number;
    name: string;
    level: number;
    class: Class;
    sight: number;
    inventory: Array<Item>;
    factions: Array<Faction>;
    hostileFactions: Array<Faction>;
    hostileEntityIds: Array<number>;
    disposition: Disposition;
}

export enum Class {
    Warrior,
    Shaman
}

export enum Faction {
    Player,
    Monster,
    Bugbear,
    Orc
}

export enum Disposition {
    Passive,
    Aggressive,
    Cowardly
}

export interface Stats {
    health: number;
    energy: number;
    mana: number;

    stamina: number;
    endurance: number;
    attunement: number;
    resistance: number;
    strength: number;
    intellect: number;
    avoidance: number;
    precision: number;
    charisma: number;
    luck: number;
}

export function getEntity(id: number) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.some(entity => {
            return entity.id === id;
        });
    }).entities.find(entity => {
        return entity.id === id;
    });
}

export function getDungeon(entity: Entity) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.indexOf(entity) > -1;
    });
}

export function getLevel(entity: Entity) {
    return game.dungeons.indexOf(getDungeon(entity));
}

export function getInventoryChar(entity: Entity, item: Item) {
    return String.fromCharCode(97 + entity.inventory.indexOf(item));
}

export function calcStats(entity: Entity) {
    const stats: Stats = {
        health: entity.level * 100,
        energy: entity.level * 100,
        mana: entity.level * 100,

        stamina: entity.level,
        endurance: entity.level,
        attunement: entity.level,
        resistance: entity.level,
        strength: entity.level,
        intellect: entity.level,
        avoidance: entity.level,
        precision: entity.level,
        charisma: entity.level,
        luck: entity.level
    }

    return stats;
}

export function tick(entity: Entity) {
    const dungeon = getDungeon(entity);

    const itemNames: Array<string> = [];
    dungeon.items.forEach((item, index) => {
        if (item.x !== entity.x || item.y !== entity.y) {
            return;
        }

        if (randomFloat(0, 1) < 0.5) {
            return;
        }

        itemNames.push(item.name);

        if (entity.id === 0) {
            return;
        }

        entity.inventory.push(item);
        dungeon.items.splice(index, 1);
    });
    if (itemNames.length) {
        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} picks up ${itemNames.join(', ')}`);

        return;
    }

    switch (entity.class) {
        case Class.Warrior:
            break;
        case Class.Shaman:
            if (randomFloat(0, 1) < 0.5) {
                break;
            }

            const corpses: Array<Corpse> = [];
            fov(dungeon, { x: entity.x, y: entity.y }, entity.sight, 1, coord => {
                dungeon.items.forEach(item => {
                    if (item.x !== coord.x || item.y !== coord.y) {
                        return;
                    }

                    if (!('originalChar' in item)) {
                        return;
                    }

                    const corpse = <Corpse>item;

                    if (!corpse.factions.every(faction => entity.hostileFactions.indexOf(faction) === -1)) {
                        return;
                    }

                    if (corpses.indexOf(corpse) > -1) {
                        return;
                    }

                    corpses.push(corpse);
                });
            });
            if (corpses.length) {
                const corpse = corpses[0];

                const newEntity: Entity = {
                    x: corpse.x,
                    y: corpse.y,
                    char: corpse.originalChar,
                    color: corpse.color,
                    alpha: corpse.alpha,
                    id: corpse.id,
                    name: corpse.name.replace(' corpse', ''),
                    level: corpse.level,
                    class: corpse.class,
                    sight: corpse.sight,
                    inventory: corpse.inventory,
                    factions: corpse.factions,
                    hostileFactions: corpse.hostileFactions,
                    hostileEntityIds: corpse.hostileEntityIds,
                    disposition: corpse.disposition
                };

                if (randomFloat(0, 1) < 0.5) {
                    log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} fails to ressurect ${newEntity.name}`);

                    return;
                }

                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} ressurects ${newEntity.name}`);

                dungeon.entities.push(newEntity);
                dungeon.items.splice(dungeon.items.indexOf(corpse), 1);

                return;
            }

            break;
    }

    switch (entity.disposition) {
        case Disposition.Passive:
            break;
        case Disposition.Aggressive:
            const targets: Array<Entity> = [];
            
            fov(dungeon, { x: entity.x, y: entity.y }, entity.sight, 1, coord => {
                return dungeon.entities.forEach(target => {
                    if (target === entity) {
                        return;
                    }

                    if (target.x !== coord.x || target.y !== coord.y) {
                        return;
                    }

                    if (target.factions.every(faction => entity.hostileFactions.indexOf(faction) === -1)) {
                        return;
                    }

                    if (targets.indexOf(target) > -1) {
                        return;
                    }

                    targets.push(target);
                });
            });

            if (targets.length) {
                const target = targets[0];

                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} spots a ${target.name}`);

                const path = astar(dungeon, { x: entity.x, y: entity.y }, { x: target.x, y: target.y });

                if (!path || !path.length) {
                    break;
                }

                const next = path.pop();

                move(entity, next.x, next.y);

                return;
            }

            break;
        case Disposition.Cowardly:
            break;
    }

    if (entity.inventory.some((item, index) => {
        if (!item.name.includes('corpse')) {
            return false;
        }

        if (randomFloat(0, 1) < 0.5) {
            return false;
        }

        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} drops a ${item.name}`);

        dungeon.items.push(item);
        entity.inventory.splice(index, 1);

        return true;
    })) {
        return;
    }

    const roll = randomFloat(0, 1);
    if (roll < 0.25) {
        move(entity, entity.x, entity.y - 1);
    } else if (roll < 0.5) {
        move(entity, entity.x + 1, entity.y);
    } else if (roll < 0.75) {
        move(entity, entity.x, entity.y + 1);
    } else {
        move(entity, entity.x - 1, entity.y);
    }
}

export function move(entity: Entity, x: number, y: number) {
    const dungeon = getDungeon(entity);

    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
        return;
    }

    switch (dungeon.cells[x][y].type) {
        case CellType.Wall:
            return;
        case CellType.DoorClosed:
            if (randomFloat(0, 1) < 0.5) {
                log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} can't open the door`);

                return;
            }

            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} opens the door`);

            dungeon.cells[x][y].type = CellType.DoorOpen;

            return;
        case CellType.StairsUp:
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} ascends`);

            changeLevel(entity, getLevel(entity) - 1, (newDungeon) => {
                for (let x = 0; x < newDungeon.width; x++) {
                    for (let y = 0; y < newDungeon.height; y++) {
                        if (newDungeon.cells[x][y].type !== CellType.StairsDown) {
                            continue;
                        }

                        return { x, y };
                    }
                }
            });

            return;
        case CellType.StairsDown:
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} descends`);

            changeLevel(entity, getLevel(entity) + 1, (newDungeon) => {
                for (let x = 0; x < newDungeon.width; x++) {
                    for (let y = 0; y < newDungeon.height; y++) {
                        if (newDungeon.cells[x][y].type !== CellType.StairsUp) {
                            continue;
                        }

                        return { x, y };
                    }
                }
            });

            return;
    }

    if (dungeon.entities.some((target, index) => {
        if (target === entity) {
            return false;
        }

        if (target.x !== x || target.y !== y) {
            return false;
        }

        if (target.factions.every(faction => entity.hostileFactions.indexOf(faction) === -1)) {
            return true;
        }

        if (randomFloat(0, 1) < 0.5) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} misses the ${target.name}`);

            return true;
        }

        if (target.id === 0 && game.godMode) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} cannot kill the ${target.name}`);

            return true;
        }

        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} kills the ${target.name}`);

        if (target.inventory.length) {
            log(dungeon, { x: entity.x, y: entity.y }, `${target.name} drops a ${target.inventory.map(item => item.name).join(', ')}`);

            target.inventory.forEach((item, index) => {
                dungeon.items.push({
                    ...item,
                    x: target.x,
                    y: target.y,
                    equipped: false
                });
                target.inventory.splice(index, 1);
            });
        }

        dungeon.items.push(<Corpse>{
            ...target,
            x: x,
            y: y,
            char: '%',
            name: target.name + ' corpse',
            equipped: false,
            originalChar: target.char
        });
        dungeon.entities.splice(index, 1);

        return true;
    }) || dungeon.chests.some((chest, index) => {
        if (chest.x !== x || chest.y !== y) {
            return false;
        }

        if (randomFloat(0, 1) < 0.5) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} can't open the chest`);

            return true;
        }

        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} opens the chest`);

        dungeon.chests.splice(index, 1);

        if (!chest.loot) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} sees nothing inside`);

            return true;
        }

        if (entity.inventory.length >= 26) {
            log(dungeon, { x: entity.x, y: entity.y }, `${entity.name}'s inventory is full`);

            return true;
        }

        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} loots a ${chest.loot.name}`);

        entity.inventory.push(chest.loot);

        return true;
    })) {
        return;
    }

    const itemNames = dungeon.items.filter(item => item.x === x && item.y === y).map(item => item.name).join(', ');
    if (itemNames) {
        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} sees ${itemNames}`);
    }

    entity.x = x;
    entity.y = y;

    function changeLevel(entity: Entity, level: number, calcSpawnCoord: (newDungeon: Dungeon) => Coord) {
        const dungeon = getDungeon(entity);

        log(dungeon, { x: entity.x, y: entity.y }, `${entity.name} has moved to level ${level}`);

        while (level >= game.dungeons.length) {
            game.dungeons.push(createDungeon(50, 50, 20, 5, 15, true, true, 0.5, 3, 20, 5));
        }

        const newDungeon = game.dungeons[level];

        newDungeon.entities.push(entity);
        dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);

        const spawn = calcSpawnCoord(newDungeon);
        entity.x = spawn.x;
        entity.y = spawn.y;
    }
}
