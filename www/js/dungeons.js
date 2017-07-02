function createTown() {
	var dungeon = {
		width: 25,
		height: 25,
		cells: [],
		rooms: [],
		entities: [],
		chests: [],
		items: []
	}

	for (var x = 0; x < dungeon.width; x++) {
		dungeon.cells[x] = [];
		for (var y = 0; y < dungeon.height; y++) {
			dungeon.cells[x][y] = {
				type: 'grass',
				discovered: false
			}
		}
	}

	var x = Math.round(dungeon.width / 2);
	var y = Math.round(dungeon.height / 2);
	dungeon.cells[x][y].type = 'stairsDown';

	var player = {
		id: 0,
		x: x,
		y: y,
		name: 'player',
		char: '@',
		level: 0,
		stats: {
			level: 1,

			health: 100,
			energy: 100,
			mana: 100,

			stamina: 0,
			endurance: 0,
			attunement: 0,
			resistance: 0,
			strength: 0,
			intellect: 0,
			avoidance: 0,
			precision: 0,
			charisma: 0,
			luck: 0,

			sight: 10
		},
		inventory: [],
		factions: [
			'player'
		],
		hostileFactions: [
			'monster'
		],
		hostileEntities: []
	}
	dungeon.entities.push(player);

	game.dungeons.push(dungeon);
}

function createDungeon(width, height, roomAttempts, minRoomSize, maxRoomSize, preventOverlap, doorChance, trapAmount, monsterAmount, chestAmount) {
	var dungeon = {
		width: width,
		height: height,
		cells: [],
		rooms: [],
		entities: [],
		chests: [],
		items: []
	}

	for (var x = 0; x < dungeon.width; x++) {
		dungeon.cells[x] = [];
		for (var y = 0; y < dungeon.height; y++) {
			dungeon.cells[x][y] = {
				type: 'empty',
				discovered: false
			}
		}
	}

	for (var i = 0; i < roomAttempts; i++) {
		var roomX = getRandomInt(0, dungeon.width);
		var roomY = getRandomInt(0, dungeon.height);
		var roomWidth = getRandomInt(minRoomSize, maxRoomSize);
		var roomHeight = getRandomInt(minRoomSize, maxRoomSize);

		if (roomX < 1 || roomX + roomWidth > dungeon.width - 1 || roomY < 1 || roomY + roomHeight > dungeon.height - 1) {
			continue;
		}

		if (preventOverlap) {
			var overlap = false;
			for (var x = roomX; x < roomX + roomWidth; x++) {
				for (var y = roomY; y < roomY + roomHeight; y++) {
					if (dungeon.cells[x][y].type == 'floor') {
						overlap = true;
					}
					if (dungeon.cells[x][y - 1].type == 'floor') {
						overlap = true;
					}
					if (dungeon.cells[x + 1][y].type == 'floor') {
						overlap = true;
					}
					if (dungeon.cells[x][y + 1].type == 'floor') {
						overlap = true;
					}
					if (dungeon.cells[x - 1][y].type == 'floor') {
						overlap = true;
					}
				}
			}
			if (overlap) {
				continue;
			}
		}

		var room = {
			x: roomX,
			y: roomY,
			width: roomWidth,
			height: roomHeight
		}

		for (var x = room.x; x < room.x + room.width; x++) {
			for (var y = room.y; y < room.y + room.height; y++) {
				dungeon.cells[x][y].type = 'floor';
			}
		}

		dungeon.rooms.push(room);
	}

	for (var i = 0; i < dungeon.rooms.length - 1; i++) {
		var x1 = getRandomInt(dungeon.rooms[i].x, dungeon.rooms[i].x + dungeon.rooms[i].width);
		var y1 = getRandomInt(dungeon.rooms[i].y, dungeon.rooms[i].y + dungeon.rooms[i].height);
		var x2 = getRandomInt(dungeon.rooms[i + 1].x, dungeon.rooms[i + 1].x + dungeon.rooms[i + 1].width);
		var y2 = getRandomInt(dungeon.rooms[i + 1].y, dungeon.rooms[i + 1].y + dungeon.rooms[i + 1].height);
		if (x1 > x2) {
			var t = x1;
			x1 = x2;
			x2 = t;
		}
		if (y1 > y2) {
			var t = y1;
			y1 = y2;
			y2 = t;
		}
		for (var x = x1; x <= x2; x++) {
			for (var y = y1; y <= y2; y++) {
				if (x == x1 || x == x2 || y == y1 || y == y2) {
					dungeon.cells[x][y].type = 'floor';
				}
			}
		}
	}

	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			if (dungeon.cells[x][y].type == 'floor') {
				if (dungeon.cells[x][y - 1].type == 'empty') {
					dungeon.cells[x][y - 1].type = 'wall';
				}
				if (dungeon.cells[x + 1][y - 1].type == 'empty') {
					dungeon.cells[x + 1][y - 1].type = 'wall';
				}
				if (dungeon.cells[x + 1][y].type == 'empty') {
					dungeon.cells[x + 1][y].type = 'wall';
				}
				if (dungeon.cells[x + 1][y + 1].type == 'empty') {
					dungeon.cells[x + 1][y + 1].type = 'wall';
				}
				if (dungeon.cells[x][y + 1].type == 'empty') {
					dungeon.cells[x][y + 1].type = 'wall';
				}
				if (dungeon.cells[x - 1][y - 1].type == 'empty') {
					dungeon.cells[x - 1][y - 1].type = 'wall';
				}
				if (dungeon.cells[x - 1][y].type == 'empty') {
					dungeon.cells[x - 1][y].type = 'wall';
				}
				if (dungeon.cells[x - 1][y + 1].type == 'empty') {
					dungeon.cells[x - 1][y + 1].type = 'wall';
				}
			}
		}
	}

	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			var roll = Math.random();
			if (roll < doorChance) {
				if (dungeon.cells[x][y].type == 'floor') {
					if (dungeon.cells[x][y - 1].type == 'floor' && dungeon.cells[x + 1][y - 1].type == 'floor' && dungeon.cells[x - 1][y - 1].type == 'floor') {
						if (dungeon.cells[x - 1][y].type == 'wall' && dungeon.cells[x + 1][y].type == 'wall') {
							dungeon.cells[x][y].type = 'doorClosed';
						}
					}
					if (dungeon.cells[x + 1][y].type == 'floor' && dungeon.cells[x + 1][y - 1].type == 'floor' && dungeon.cells[x + 1][y + 1].type == 'floor') {
						if (dungeon.cells[x][y + 1].type == 'wall' && dungeon.cells[x][y - 1].type == 'wall') {
							dungeon.cells[x][y].type = 'doorClosed';
						}
					}
					if (dungeon.cells[x][y + 1].type == 'floor' && dungeon.cells[x + 1][y + 1].type == 'floor' && dungeon.cells[x - 1][y + 1].type == 'floor') {
						if (dungeon.cells[x - 1][y].type == 'wall' && dungeon.cells[x + 1][y].type == 'wall') {
							dungeon.cells[x][y].type = 'doorClosed';
						}
					}
					if (dungeon.cells[x - 1][y].type == 'floor' && dungeon.cells[x - 1][y - 1].type == 'floor' && dungeon.cells[x - 1][y + 1].type == 'floor') {
						if (dungeon.cells[x][y + 1].type == 'wall' && dungeon.cells[x][y - 1].type == 'wall') {
							dungeon.cells[x][y].type = 'doorClosed';
						}
					}
				}
			}
		}
	}

	if (dungeon.rooms.length > 0) {
		for (var i = 0; i < trapAmount; i++) {
			var roomIndex = getRandomInt(0, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			dungeon.cells[x][y].type = 'trap';
		}
	}

	if (dungeon.rooms.length > 0) {
		var x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
		var y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);
		dungeon.cells[x][y].type = 'stairsUp';
	}

	if (dungeon.rooms.length > 0) {
		var x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
		var y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);
		dungeon.cells[x][y].type = 'stairsDown';
	}

	if (dungeon.rooms.length > 1) {
		for (var i = 0; i < monsterAmount; i++) {
			var roomIndex = getRandomInt(1, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			var monster = {
				id: game.id++,
				x: x,
				y: y,
				name: '',
				char: '',
				level: game.dungeons.length,
				stats: {
					level: 1,

					health: 100,
					energy: 100,
					mana: 100,

					stamina: 0,
					endurance: 0,
					attunement: 0,
					resistance: 0,
					strength: 0,
					intellect: 0,
					avoidance: 0,
					precision: 0,
					charisma: 0,
					luck: 0,

					sight: 10
				},
				inventory: [],
				factions: [],
				hostileFactions: [],
				hostileEntities: []
			}
			var roll = Math.random();
			if (roll < 0.25) {
				monster.name = 'rat';
				monster.char = 'r';
				monster.factions = [
					'monster',
					'rat'
				];
				monster.hostileFactions = [
					'player'
				];
			} else if (roll < 0.50) {
				monster.name = 'slime';
				monster.char = 's';
				monster.factions = [
					'monster',
					'slime'
				];
				monster.hostileFactions = [
					'player'
				];
			} else if (roll < 0.75) {
				monster.name = 'orc';
				monster.char = 'o';
				monster.factions = [
					'monster',
					'orc'
				];
				monster.hostileFactions = [
					'player',
					'bugbear'
				];
			} else {
				monster.name = 'bugbear';
				monster.char = 'b';
				monster.factions = [
					'monster',
					'bugbear'
				];
				monster.hostileFactions = [
					'player',
					'orc'
				];
			}
			dungeon.entities.push(monster);
		}
	}

	if (dungeon.rooms.length > 0) {
		for (var i = 0; i < chestAmount; i++) {
			var roomIndex = getRandomInt(0, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

			var chest = {
				x: x,
				y: y,
				loot: (function () {
					var roll = Math.random();
					if (roll < 0) {
						chest.loot = null;
					} else {
						var item = {
							x: -1,
							y: -1,
							name: '',
							char: '',
							index: ''
						}
						var roll = Math.random();
						if (roll < 0.25) {
							loot.name = 'sword';
							loot.char = '|';
						} else if (roll < 0.50) {
							loot.name = 'spear';
							loot.char = '/';
						} else if (roll < 0.75) {
							loot.name = 'shield';
							loot.char = ')';
						} else {
							loot.name = 'bow';
							loot.char = '}';
						}
						return item;
					}
				}())
			}

			dungeon.chests.push(chest);
		}
	}

	game.dungeons.push(dungeon);
}
