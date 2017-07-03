function getPlayer() {
    for (let i = 0; i < game.dungeons.length; i++) {
        for (let j = 0; j < game.dungeons[i].entities.length; j++) {
            if (game.dungeons[i].entities[j].id === 0) {
                return game.dungeons[i].entities[j];
            }
        }
    }

    throw new Error('A player should always exist');
}

function tick() {
    if (!game.stopTime) {
        game.dungeons.forEach(dungeon => {
            dungeon.entities.forEach(entity => {
                if (entity.id === 0) {
                    return;
                }

                tickEntity(entity);
            });
        });
    }

    game.turn++;
}

function tickEntity(entity) {
    const dungeon = game.dungeons[entity.level];

    const targets = [];
    for (let dir = 0; dir < 360; dir += 10) {
        raycast(dungeon, entity.x, entity.y, entity.stats.sight, dir, [
            'wall',
            'doorClosed'
        ], (x, y) => {
            if (dungeon.entities.some(target => {
                if (target === entity) {
                    return false;
                }

                if (targets.indexOf(target) > -1) {
                    return false;
                }

                if (target.x !== x || target.y !== y) {
                    return false;
                }

                if (target.factions.some(faction => {
                    return entity.hostileFactions.indexOf(faction) > -1;
                })) {
                    targets.push(target);

                    return true;
                }
            })) {
                return true;
            }
        });
    }

    if (targets.length > 0) {
        const target = targets[0];

        game.messages.push('the ' + entity.name + ' spots a ' + target.name);

        const path = pathfind(dungeon, entity.x, entity.y, target.x, target.y);
        if (path && path.length > 0) {
            const next = path.pop();

            moveEntity(entity, next.x, next.y);
        }
    } else {
        const roll = Math.random();
        if (roll < 0.25) {
            moveEntity(entity, entity.x, entity.y - 1);
        } else if (roll < 0.5) {
            moveEntity(entity, entity.x + 1, entity.y);
        } else if (roll < 0.75) {
            moveEntity(entity, entity.x, entity.y + 1);
        } else {
            moveEntity(entity, entity.x - 1, entity.y);
        }
    }
}

function moveEntity(entity, x, y) {
    const dungeon = game.dungeons[entity.level];

    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
        return;
    }

    switch (dungeon.cells[x][y].type) {
        case 'wall':
            return;
        case 'doorClosed':
            const roll = Math.random();
            if (roll > 0.5) {
                game.messages.push('the ' + entity.name + ' opens the door');
                dungeon.cells[x][y].type = 'doorOpen';
            } else {
                game.messages.push('the ' + entity.name + ' can\'t open the door');
            }

            return;
        case 'stairsUp':
            game.messages.push(entity.name + ' ascends');

            changeLevel(entity, entity.level - 1, (newDungeon) => {
                for (let x = 0; x < newDungeon.width; x++) {
                    for (let y = 0; y < newDungeon.height; y++) {
                        if (newDungeon.cells[x][y].type === 'stairsDown') {
                            return { x, y };
                        }
                    }
                }
            });

            return;
        case 'stairsDown':
            game.messages.push(entity.name + ' descends');

            changeLevel(entity, entity.level + 1, (newDungeon) => {
                for (let x = 0; x < newDungeon.width; x++) {
                    for (let y = 0; y < newDungeon.height; y++) {
                        if (newDungeon.cells[x][y].type === 'stairsUp') {
                            return { x, y };
                        }
                    }
                }
            });

            return;
    }

    if (dungeon.entities.some(target => {
        if (target === entity) {
            return false;
        }

        if (target.x !== x || target.y !== y) {
            return false;
        }

        if (target.factions.some(faction => {
            return entity.hostileFactions.indexOf(faction) > -1;
        })) {
            const roll = Math.random();
            if (roll < 0.5) {
                game.messages.push('the ' + entity.name + ' misses the ' + target.name);
            } else {
                if (target.id === 0 && game.godMode) {
                    game.messages.push('the ' + entity.name + ' cannot kill the ' + target.name);

                    return true;
                }

                game.messages.push('the ' + entity.name + ' kills the ' + target.name);

                target.inventory.forEach(item => {
                    game.messages.push('the ' + target.name + ' drops a ' + item.name);
                    item.x = x;
                    item.y = y;
                    dungeon.items.push(item);
                });

                const corpse = {
                    x: x,
                    y: y,
                    name: target.name + ' corpse',
                    char: '%',
                    index: ''
                }
                dungeon.items.push(corpse);

                dungeon.entities.splice(dungeon.entities.indexOf(target), 1);
            }
        }

        return true;
    }) || dungeon.chests.some(chest => {
        if (chest.x !== x || chest.y !== y) {
            return false;
        }

        const roll = Math.random();
        if (roll > 0.5) {
            game.messages.push('the ' + entity.name + ' opens the chest');

            if (chest.loot) {
                if (entity.inventory.length >= 26) {
                    game.messages.push(entity.name + '\'s inventory is full');
                } else {
                    game.messages.push('the ' + entity.name + ' loots a ' + chest.loot.name);

                    entity.inventory.push(chest.loot);
                }
            } else {
                game.messages.push('the ' + entity.name + ' sees nothing inside');
            }

            dungeon.chests.splice(dungeon.chests.indexOf(chest), 1);
        } else {
            game.messages.push('the ' + entity.name + ' can\'t open the chest');
        }

        return true;
    })) {
        return;
    }

    const itemNames = dungeon.items.filter(item => {
        return item.x === x && item.y === y;
    }).map(item => item.name).join(', ');
    if (itemNames) {
        game.messages.push('the ' + entity.name + ' sees a ' + itemNames);
    }

    entity.x = x;
    entity.y = y;
}

function changeLevel(entity, level, calcSpawn) {
    while (level >= game.dungeons.length) {
        game.dungeons.push(createDungeon(50, 50, 20, 5, 15, false, 0.5, 3, 5, 5));
    }

    const dungeon = game.dungeons[entity.level];
    const newDungeon = game.dungeons[level];

    dungeon.entities.splice(dungeon.entities.indexOf(entity), 1);
    entity.level = level;
    newDungeon.entities.push(entity);

    const spawn = calcSpawn(newDungeon);
    entity.x = spawn.x;
    entity.y = spawn.y;

    game.messages.push(entity.name + ' has moved to level ' + entity.level);
}
