function tick() {
    if (game.stopTime) {
        return;
    }

    game.dungeons.forEach(dungeon => {
        dungeon.entities.forEach(entity => {
            if (entity.id === 0) {
                return;
            }

            switch (entity.class) {
                case Class.Warrior:
                    break;
                case Class.Shaman:
                    if (Math.random() < 0.5) {
                        break;
                    }

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

                                if (corpse.factions.every(faction => entity.hostileFactions.indexOf(faction) === -1)) {
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

                        addMessage(entity.name + ' ressurects ' + corpse.name.replace(' corpse', ''));

                        dungeon.entities.push({
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
                        });
                        dungeon.items.splice(dungeon.items.indexOf(corpse), 1);

                        return;
                    }
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

                        addMessage(`${entity.name} spots a ${target.name}`);

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
        });
    });

    game.turn++;
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
                return addMessage(entity.name + ' can\'t open the door');
            }

            addMessage(entity.name + ' opens the door');

            dungeon.cells[x][y].type = CellType.DoorOpen;

            return;
        case CellType.StairsUp:
            addMessage(entity.name + ' ascends');

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
            addMessage(entity.name + ' descends');

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
            addMessage(entity.name + ' misses the ' + target.name);

            return true;
        }

        if (target.id === 0 && game.godMode) {
            addMessage(entity.name + ' cannot kill the ' + target.name);

            return true;
        }

        addMessage(entity.name + ' kills the ' + target.name);

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

        if (target.inventory.length) {
            addMessage(target.name + ' drops a ' + target.inventory.map(item => item.name).join(', '));

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

        return true;
    }) || dungeon.chests.some((chest, index) => {
        if (chest.x !== x || chest.y !== y) {
            return false;
        }

        if (Math.random() < 0.5) {
            addMessage(entity.name + ' can\'t open the chest');

            return true;
        }

        addMessage(entity.name + ' opens the chest');

        dungeon.chests.splice(index, 1);

        if (!chest.loot) {
            addMessage(entity.name + ' sees nothing inside');

            return true;
        }

        if (entity.inventory.length >= 26) {
            addMessage(entity.name + '\'s inventory is full');

            return true;
        }

        addMessage(entity.name + ' loots a ' + chest.loot.name);

        entity.inventory.push(chest.loot);

        return true;
    })) {
        return;
    }

    const items = dungeon.items.filter(item => item.x === x && item.y === y);
    if (items.length) {
        if (entity.id === 0) {
            addMessage(entity.name + ' sees a ' + items.map(item => item.name).join(', '));
        } else {
            addMessage(entity.name + ' picks up a ' + items.map(item => item.name).join(', '));

            items.forEach((item, index) => {
                entity.inventory.push(item);
                dungeon.items.splice(index, 1);
            });
        }
    }

    entity.x = x;
    entity.y = y;
}

function changeLevel(entity: Entity, level: number, calcSpawn: (newDungeon: Dungeon) => Coord) {
    while (level >= game.dungeons.length) {
        game.dungeons.push(createDungeon(50, 50, 20, 5, 15, true, true, 0.5, 3, 20, 5));
    }

    const dungeon = getDungeon(entity);
    const newDungeon = game.dungeons[level];

    newDungeon.entities.push(entity);
    dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);

    const spawn = calcSpawn(newDungeon);
    entity.x = spawn.x;
    entity.y = spawn.y;

    addMessage(entity.name + ' has moved to level ' + getLevel(entity));
}
