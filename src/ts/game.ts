function getPlayer() {
    // return game.dungeons[game.dungeons.length - 1].entities[0];

    for (let i = 0; i < game.dungeons.length; i++) {
        for (let j = 0; j < game.dungeons[i].entities.length; j++) {
            if (game.dungeons[i].entities[j].id !== 0) {
                continue;
            }

            return game.dungeons[i].entities[j];
        }
    }

    throw new Error('A player should always exist');
}

function tick() {
    if (game.stopTime) {
        return;
    }

    game.dungeons.forEach(dungeon => {
        dungeon.entities.forEach(entity => {
            if (entity === getPlayer()) {
                return;
            }

            let targets: Array<Entity> = [];
            switch (entity.disposition) {
                case Disposition.Passive:
                    wander(entity);

                    break;
                case Disposition.Aggressive:
                    for (let dir = 0; dir < 360; dir += 10) {
                        raycast(dungeon, { x: entity.x, y: entity.y }, entity.stats.sight, dir, [
                            CellType.Wall,
                            CellType.DoorClosed
                        ], (x, y) => {
                            if (dungeon.entities.some(target => {
                                if (target === entity) {
                                    return false;
                                }

                                if (target.x !== x || target.y !== y) {
                                    return false;
                                }

                                if (!target.factions.some(faction => entity.hostileFactions.indexOf(faction) > -1)) {
                                    return false;
                                }

                                if (targets.indexOf(target) > -1) {
                                    return false;
                                }

                                targets.push(target);

                                return true;
                            })) {
                                return true;
                            }
                        });
                    }

                    if (targets.length > 0) {
                        const target = targets[0];

                        addMessage(`${entity.name} spots a ${target.name}`);

                        const path = pathfind(dungeon, { x: entity.x, y: entity.y }, { x: target.x, y: target.y });

                        if (!path || !path.length) {
                            break;
                        }

                        const next = path.pop();

                        move(entity, next.x, next.y);

                        break;
                    }

                    wander(entity);

                    break;
                case Disposition.Cowardly:
                    wander(entity);

                    break;
            }
        });
    });

    game.turn++;
}

function wander(entity: Entity) {
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
    const dungeon = game.dungeons[entity.level];

    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
        return;
    }

    switch (dungeon.cells[x][y].type) {
        case CellType.Wall:
            return;
        case CellType.DoorClosed:
            const roll = Math.random();
            if (roll < 0.5) {
                addMessage(entity.name + ' opens the door');

                dungeon.cells[x][y].type = CellType.DoorOpen;
            } else {
                addMessage(entity.name + ' can\'t open the door');
            }

            return;
        case CellType.StairsUp:
            addMessage(entity.name + ' ascends');

            changeLevel(entity, entity.level - 1, (newDungeon) => {
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
            addMessage(entity.name + ' descends');

            changeLevel(entity, entity.level + 1, (newDungeon) => {
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

    if (dungeon.entities.some((target, index) => {
        if (target === entity) {
            return false;
        }

        if (target.x !== x || target.y !== y) {
            return false;
        }

        if (target.factions.some(faction => entity.hostileFactions.indexOf(faction) > -1)) {
            if (Math.random() < 0.5) {
                addMessage(entity.name + ' misses the ' + target.name);

                return true;
            }

            if (target.id === 0 && game.godMode) {
                addMessage(entity.name + ' cannot kill the ' + target.name);

                return true;
            }

            addMessage(entity.name + ' kills the ' + target.name);

            target.inventory.forEach((item, index) => {
                addMessage(target.name + ' drops a ' + item.name);

                dungeon.items.push({
                    ...item,
                    x: x,
                    y: x
                });

                target.inventory.splice(index, 1);
            });

            const corpse: Corpse = {
                x: x,
                y: y,
                char: '%',
                color: target.color,
                alpha: target.alpha,
                id: target.id,
                name: target.name + ' corpse',
                level: target.level,
                class: target.class,
                stats: target.stats,
                inventory: target.inventory,
                factions: target.factions,
                hostileFactions: target.hostileFactions,
                hostileEntityIds: target.hostileEntityIds,
                disposition: target.disposition,
                index: '',
                equipped: false,
                originalChar: target.char
            };
            dungeon.items.push(corpse);

            dungeon.entities.splice(index, 1);
        }

        return true;
    }) || dungeon.chests.some((chest, index) => {
        if (chest.x !== x || chest.y !== y) {
            return false;
        }

        if (Math.random() < 0.5) {
            addMessage(entity.name + ' can\'t open the chest');

            return false;
        }

        addMessage(entity.name + ' opens the chest');

        if (chest.loot) {
            if (entity.inventory.length < 26) {
                addMessage(entity.name + ' loots a ' + chest.loot.name);

                entity.inventory.push(chest.loot);
            } else {
                addMessage(entity.name + '\'s inventory is full');
            }
        } else {
            addMessage(entity.name + ' sees nothing inside');
        }

        dungeon.chests.splice(index, 1);

        return true;
    })) {
        return;
    }

    const itemNames = dungeon.items.filter(item => item.x === x && item.y === y).map(item => item.name).join(', ');
    if (itemNames) {
        addMessage(entity.name + ' sees a ' + itemNames);
    }

    entity.x = x;
    entity.y = y;
}

function changeLevel(entity: Entity, level: number, calcSpawn: (newDungeon: Dungeon) => Coord) {
    while (level >= game.dungeons.length) {
        game.dungeons.push(createDungeon(50, 50, 20, 5, 15, true, true, 0.5, 3, 20, 5));
    }

    const dungeon = game.dungeons[entity.level];
    const newDungeon = game.dungeons[level];

    dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);
    entity.level = level;
    newDungeon.entities.push(entity);

    const spawn = calcSpawn(newDungeon);
    entity.x = spawn.x;
    entity.y = spawn.y;

    addMessage(entity.name + ' has moved to level ' + entity.level);
}

function addMessage(message: string) {
    game.messages.push(message);

    if (game.messages.length > ui.maxMessages) {
        game.messages.shift();
    }
}
