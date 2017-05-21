var game = {
	id: 1,
	dungeons: [],
	turn: 0,
	messages: [],
	stopTime: false,
	ignoreFov: false
}

function getPlayer() {
	for (var i = 0; i < game.dungeons.length; i++) {
		for (var j = 0; j < game.dungeons[i].entities.length; j++) {
			if (game.dungeons[i].entities[j].id == 0) {
				return game.dungeons[i].entities[j];
			}
		}
	}
	return null;
}

function tick() {
	if (!game.stopTime) {
		for (var i = 0; i < game.dungeons.length; i++) {
			for (var j = 0; j < game.dungeons[i].entities.length; j++) {
				if (game.dungeons[i].entities[j].id == 0) {
					continue;
				}

				tickEntity(game.dungeons[i].entities[j]);
			}
		}
	}

	game.turn++;
}

function tickEntity(entity) {
	var targets = [];
	for (var dir = 0; dir < 360; dir += 10) {
		raycast(game.dungeons[entity.level], entity.x, entity.y, entity.stats.sight, dir, [
			'wall',
			'doorClosed'
		], function (x, y) {
			for (var i = 0; i < game.dungeons[entity.level].entities.length; i++) {
				if (game.dungeons[entity.level].entities[i] == entity) {
					continue;
				}
				if (targets.indexOf(game.dungeons[entity.level].entities[i]) > -1) {
					continue;
				}

				if (game.dungeons[entity.level].entities[i].x == x && game.dungeons[entity.level].entities[i].y == y) {
					var hostile = false;
					for (var j = 0; j < game.dungeons[entity.level].entities[i].factions.length; j++) {
						if (entity.hostileFactions.indexOf(game.dungeons[entity.level].entities[i].factions[j]) > -1) {
							hostile = true;
							break;
						}
					}
					if (hostile) {
						targets.push(game.dungeons[entity.level].entities[i]);
						return true;
					}
				}
			}
		});
	}

	if (targets.length > 0) {
		var target = targets[0];
		game.messages.push('the ' + entity.name + ' spots a ' + target.name);

		var path = pathfind(game.dungeons[entity.level], entity.x, entity.y, target.x, target.y);
		if (path != null && path.length > 0) {
			next = path.pop();
			moveEntity(entity, next.x, next.y);
		}
	} else {
		var roll = Math.random();
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
	var move = true;
	var ascend = false;
	var descend = false;

	if (x >= 0 && x < game.dungeons[entity.level].width && y >= 0 && y < game.dungeons[entity.level].height) {
		switch (game.dungeons[entity.level].cells[x][y].type) {
			case 'wall':
				move = false;
				break;
			case 'doorClosed':
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push('the ' + entity.name + ' opens the door');
					game.dungeons[entity.level].cells[x][y].type = 'doorOpen';
				} else {
					game.messages.push('the ' + entity.name + ' can\'t open the door');
				}
				break;
			case 'stairsUp':
				game.messages.push(entity.name + ' ascends');
				ascend = true;
				break;
			case 'stairsDown':
				game.messages.push(entity.name + ' descends');
				descend = true;
				break;
		}

		for (var i = 0; i < game.dungeons[entity.level].entities.length; i++) {
			if (game.dungeons[entity.level].entities[i] == entity) {
				continue;
			}

			if (game.dungeons[entity.level].entities[i].x == x && game.dungeons[entity.level].entities[i].y == y) {
				move = false;
				var hostile = false;
				for (var j = 0; j < game.dungeons[entity.level].entities[i].factions.length; j++) {
					if (entity.hostileFactions.indexOf(game.dungeons[entity.level].entities[i].factions[j]) > -1) {
						hostile = true;
						break;
					}
				}
				if (hostile) {
					var roll = Math.random();
					if (roll < 0.5) {
						game.messages.push('the ' + entity.name + ' misses the ' + game.dungeons[entity.level].entities[i].name);
					} else {
						// FIXME
						if (game.dungeons[entity.level].entities[i].id == 0) {
							break;
						}
						game.messages.push('the ' + entity.name + ' kills the ' + game.dungeons[entity.level].entities[i].name);
						for (var j = 0; j < game.dungeons[entity.level].entities[i].inventory.length; j++) {
							game.messages.push('the ' + game.dungeons[entity.level].entities[i].name + ' drops a ' + game.dungeons[entity.level].entities[i].inventory[j].name);
							game.dungeons[entity.level].entities[i].inventory[j].x = x;
							game.dungeons[entity.level].entities[i].inventory[j].y = y;
							game.dungeons[entity.level].items.push(game.dungeons[entity.level].entities[i].inventory[j]);
						}
						var corpse = {
							x: x,
							y: y,
							name: game.dungeons[entity.level].entities[i].name + ' corpse',
							char: '%',
							index: ''
						}
						game.dungeons[entity.level].items.push(corpse);
						game.dungeons[entity.level].entities.splice(i, 1);
					}
					break;
				}
			}
		}

		for (var i = 0; i < game.dungeons[entity.level].chests.length; i++) {
			if (game.dungeons[entity.level].chests[i].x == x && game.dungeons[entity.level].chests[i].y == y) {
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push('the ' + entity.name + ' opens the chest');
					var loot = game.dungeons[entity.level].chests[i].loot;
					if (loot == null) {
						game.messages.push('the ' + entity.name + ' sees nothing inside');
					} else {
						if (entity.inventory.length >= 26) {
							game.messages.push(entity.name + '\'s inventory is full');
						} else {
							game.messages.push('the ' + entity.name + ' loots a ' + loot.name);
							entity.inventory.push(loot);
						}
					}
					game.dungeons[entity.level].chests.splice(i, 1);
				} else {
					game.messages.push('the ' + entity.name + ' can\'t open the chest');
				}
				break;
			}
		}

		var itemNames = [];
		for (var i = 0; i < game.dungeons[entity.level].items.length; i++) {
			if (x == game.dungeons[entity.level].items[i].x && y == game.dungeons[entity.level].items[i].y) {
				itemNames.push(game.dungeons[entity.level].items[i].name);
			}
		}
		if (itemNames.length > 0) {
			game.messages.push('the ' + entity.name + ' sees a ' + itemNames.join(', '));
		}
	} else {
		move = false;
	}

	if (move) {
		entity.x = x;
		entity.y = y;
	}
	if (ascend) {
		changeLevel(entity, entity.level - 1, 'stairsDown');
	}
	if (descend) {
		changeLevel(entity, entity.level + 1, 'stairsUp');
	}
}

function changeLevel(entity, level, cellType) {
	if (level == game.dungeons.length) {
		createDungeon(50, 50, 20, 5, 15, false, 0.5, 3, 5, 5);
	}

	game.dungeons[entity.level].entities.splice(game.dungeons[entity.level].entities.indexOf(entity), 1);
	entity.level = level;
	game.dungeons[entity.level].entities.push(entity);

	for (var x = 0; x < game.dungeons[entity.level].width; x++) {
		for (var y = 0; y < game.dungeons[entity.level].height; y++) {
			if (game.dungeons[entity.level].cells[x][y].type == cellType) {
				entity.x = x;
				entity.y = y;
				break;
			}
		}
	}
	
	game.messages.push(entity.name + ' has moved to level ' + (entity.level));
}
