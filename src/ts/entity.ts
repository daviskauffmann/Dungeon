function getEntity(id: number) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.some(entity => {
            return entity.id === id;
        });
    }).entities.find(entity => {
        return entity.id === id;
    });
}

function getDungeon(entity: Entity) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.indexOf(entity) > -1;
    });
}

function getLevel(entity: Entity) {
    return game.dungeons.indexOf(getDungeon(entity));
}

function getInventoryChar(entity: Entity, item: Item) {
    return String.fromCharCode(97 + entity.inventory.indexOf(item));
}

function think(entity: Entity) {
    const dungeon = getDungeon(entity);

    switch (entity.class) {
        case Class.Warrior:
            break;
        case Class.Shaman:
            const corpses: Array<Corpse> = [];

            for (let dir = 0; dir < 360; dir++) {
                raycast(dungeon, { x: entity.x, y: entity.y }, entity.stats.sight, dir, [
                    CellType.Wall,
                    CellType.DoorClosed
                ], (x, y) => {
                    dungeon.items.forEach((item, index) => {
                        if (item.x !== x || item.y !== y) {
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
            }

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
                    class: corpse.class,
                    stats: corpse.stats,
                    inventory: corpse.inventory,
                    factions: corpse.factions,
                    hostileFactions: corpse.hostileFactions,
                    hostileEntityIds: corpse.hostileEntityIds,
                    disposition: corpse.disposition
                };

                if (Math.random() < 0.5) {
                    log(`${entity.name} fails to ressurect ${newEntity.name}`);

                    return;
                }

                log(`${entity.name} ressurects ${newEntity.name}`);

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

            for (let dir = 0; dir < 360; dir += 10) {
                raycast(dungeon, { x: entity.x, y: entity.y }, entity.stats.sight, dir, [
                    CellType.Wall,
                    CellType.DoorClosed
                ], (x, y) => {
                    dungeon.entities.forEach(target => {
                        if (target === entity) {
                            return false;
                        }

                        if (target.x !== x || target.y !== y) {
                            return false;
                        }

                        if (target.factions.every(faction => entity.hostileFactions.indexOf(faction) === -1)) {
                            return false;
                        }

                        if (targets.indexOf(target) > -1) {
                            return false;
                        }

                        targets.push(target);
                    });
                });
            }

            if (targets.length) {
                const target = targets[0];

                log(`${entity.name} spots a ${target.name}`);

                const path = pathfind(dungeon, { x: entity.x, y: entity.y }, { x: target.x, y: target.y });

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

    const roll = Math.random();
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

function move(entity: Entity, x: number, y: number) {
    const dungeon = getDungeon(entity);

    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
        return;
    }

    switch (dungeon.cells[x][y].type) {
        case CellType.Wall:
            return;
        case CellType.DoorClosed:
            if (Math.random() < 0.5) {
                log(`${entity.name} can't open the door`);

                return;
            }

            log(`${entity.name} opens the door`);

            dungeon.cells[x][y].type = CellType.DoorOpen;

            return;
        case CellType.StairsUp:
            log(`${entity.name} ascends`);

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
            log(`${entity.name} descends`);

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

        if (Math.random() < 0.5) {
            log(`${entity.name} misses the ${target.name}`);

            return true;
        }

        if (target.id === 0 && game.godMode) {
            log(`${entity.name} cannot kill the ${target.name}`);

            return true;
        }

        log(`${entity.name} kills the ${target.name}`);

        if (target.inventory.length) {
            log(`${target.name} drops a ${target.inventory.map(item => item.name).join(', ')}`);

            target.inventory.forEach((item, index) => {
                item.x = target.x;
                item.y = target.y;
                item.equipped = false;

                dungeon.items.push(item);
                target.inventory.splice(index, 1);
            });
        }

        const corpse: Corpse = {
            x: x,
            y: y,
            char: '%',
            color: target.color,
            alpha: target.alpha,
            id: target.id,
            name: target.name + ' corpse',
            class: target.class,
            stats: target.stats,
            inventory: target.inventory,
            factions: target.factions,
            hostileFactions: target.hostileFactions,
            hostileEntityIds: target.hostileEntityIds,
            disposition: target.disposition,
            equipped: false,
            originalChar: target.char
        };

        dungeon.items.push(corpse);
        dungeon.entities.splice(index, 1);

        return true;
    }) || dungeon.chests.some((chest, index) => {
        if (chest.x !== x || chest.y !== y) {
            return false;
        }

        if (Math.random() < 0.5) {
            log(`${entity.name} can't open the chest`);

            return true;
        }

        log(`${entity.name} opens the chest`);

        dungeon.chests.splice(index, 1);

        if (!chest.loot) {
            log(`${entity.name} sees nothing inside`);

            return true;
        }

        if (entity.inventory.length >= 26) {
            log(`${entity.name}'s inventory is full`);

            return true;
        }

        log(`${entity.name} loots a ${chest.loot.name}`);

        entity.inventory.push(chest.loot);

        return true;
    })) {
        return;
    }

    const itemNames: Array<string> = [];
    dungeon.items.forEach((item, index) => {
        if (item.x !== x || item.y !== y) {
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
        if (entity.id === 0) {
            log(`${entity.name} sees ${itemNames.join(', ')}`);
        } else {
            log(`${entity.name} picks up ${itemNames.join(', ')}`);
        }
    }

    entity.x = x;
    entity.y = y;
}

function changeLevel(entity: Entity, level: number, calcSpawnCoord: (newDungeon: Dungeon) => Coord) {
    while (level >= game.dungeons.length) {
        game.dungeons.push(createDungeon(50, 50, 20, 5, 15, true, true, 0.5, 3, 20, 5));
    }

    const dungeon = getDungeon(entity);
    const newDungeon = game.dungeons[level];

    newDungeon.entities.push(entity);
    dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);

    const spawn = calcSpawnCoord(newDungeon);
    entity.x = spawn.x;
    entity.y = spawn.y;

    log(`${entity.name} has moved to level ${getLevel(entity)}`);
}