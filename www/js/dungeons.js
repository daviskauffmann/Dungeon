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
	// create the grass
	for (var x = 0; x < dungeon.width; x++) {
		dungeon.cells[x] = [];
		for (var y = 0; y < dungeon.height; y++) {
			dungeon.cells[x][y] = {
				type: "grass",
				discovered: false
			}
		}
	}
	// create the stairs down
	var x = Math.round(dungeon.width / 2);
	var y = Math.round(dungeon.height / 2);
	dungeon.cells[x][y].type = "stairsDown";
	// create the player
	var player = {
		id: 0,
		x: x,
		y: y,
		name: "player",
		char: "@",
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
			"player"
		],
		hostileFactions: [
			"monster"
		],
		hostileEntities: []
	}
	dungeon.entities.push(player);
	// add to the list
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
	// create cells
	for (var x = 0; x < dungeon.width; x++) {
		dungeon.cells[x] = [];
		for (var y = 0; y < dungeon.height; y++) {
			dungeon.cells[x][y] = {
				type: "empty",
				discovered: false
			}
		}
	}
	// generate rooms
	for (var i = 0; i < roomAttempts; i++) {
		var roomX = getRandomInt(0, dungeon.width);
		var roomY = getRandomInt(0, dungeon.height);
		var roomWidth = getRandomInt(minRoomSize, maxRoomSize);
		var roomHeight = getRandomInt(minRoomSize, maxRoomSize);
		// check bounds
		// the edges of the room should not be at the very edge of the map, because walls are generated adjacent to floor cells
		if (roomX < 1 || roomX + roomWidth > dungeon.width - 1 || roomY < 1 || roomY + roomHeight > dungeon.height - 1) {
			continue;
		}
		// check overlap
		// this is done by looping through all the cells in the prospective room and checking if they are already a floor
		// checking NESW cells is done so rooms don't end up 
		// this is an optional step. if not done, the dungeon will be more cavernous
		if (preventOverlap) {
			var overlap = false;
			for (var x = roomX; x < roomX + roomWidth; x++) {
				for (var y = roomY; y < roomY + roomHeight; y++) {
					if (dungeon.cells[x][y].type == "floor") {
						overlap = true;
					}
					if (dungeon.cells[x][y - 1].type == "floor") {
						overlap = true;
					}
					if (dungeon.cells[x + 1][y].type == "floor") {
						overlap = true;
					}
					if (dungeon.cells[x][y + 1].type == "floor") {
						overlap = true;
					}
					if (dungeon.cells[x - 1][y].type == "floor") {
						overlap = true;
					}
				}
			}
			if (overlap) {
				continue;
			}
		}
		// create a room
		var room = {
			x: roomX,
			y: roomY,
			width: roomWidth,
			height: roomHeight
		}
		// turn this room's cells into floors
		for (var x = room.x; x < room.x + room.width; x++) {
			for (var y = room.y; y < room.y + room.height; y++) {
				dungeon.cells[x][y].type = "floor";
			}
		}
		// add to the list
		dungeon.rooms.push(room);
	}
	// connect rooms
	// this algorithm simply loops through the rooms and connects it to the one at the next index
	// connecting the rooms is done by selecting a random cell in the first room and a random one in the second
	// then, it draws a rectangle between those two points
	// this ensures that all rooms have at least two modes of entry and exit, and that there are no "island" rooms
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
					dungeon.cells[x][y].type = "floor";
				}
			}
		}
	}
	// create walls
	// each floor cell looks at its neighbors and turns them into walls if they are empty
	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			if (dungeon.cells[x][y].type == "floor") {
				if (dungeon.cells[x][y - 1].type == "empty") {
					dungeon.cells[x][y - 1].type = "wall";
				}
				if (dungeon.cells[x + 1][y - 1].type == "empty") {
					dungeon.cells[x + 1][y - 1].type = "wall";
				}
				if (dungeon.cells[x + 1][y].type == "empty") {
					dungeon.cells[x + 1][y].type = "wall";
				}
				if (dungeon.cells[x + 1][y + 1].type == "empty") {
					dungeon.cells[x + 1][y + 1].type = "wall";
				}
				if (dungeon.cells[x][y + 1].type == "empty") {
					dungeon.cells[x][y + 1].type = "wall";
				}
				if (dungeon.cells[x - 1][y - 1].type == "empty") {
					dungeon.cells[x - 1][y - 1].type = "wall";
				}
				if (dungeon.cells[x - 1][y].type == "empty") {
					dungeon.cells[x - 1][y].type = "wall";
				}
				if (dungeon.cells[x - 1][y + 1].type == "empty") {
					dungeon.cells[x - 1][y + 1].type = "wall";
				}
			}
		}
	}
	// create doors if it has two adjacent walls and three floors ahead of it
	// this is checked for all four directions
	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			var roll = Math.random();
			if (roll < doorChance) {
				if (dungeon.cells[x][y].type == "floor") {
					if (dungeon.cells[x][y - 1].type == "floor" && dungeon.cells[x + 1][y - 1].type == "floor" && dungeon.cells[x - 1][y - 1].type == "floor") {
						if (dungeon.cells[x - 1][y].type == "wall" && dungeon.cells[x + 1][y].type == "wall") {
							dungeon.cells[x][y].type = "doorClosed";
						}
					}
					if (dungeon.cells[x + 1][y].type == "floor" && dungeon.cells[x + 1][y - 1].type == "floor" && dungeon.cells[x + 1][y + 1].type == "floor") {
						if (dungeon.cells[x][y + 1].type == "wall" && dungeon.cells[x][y - 1].type == "wall") {
							dungeon.cells[x][y].type = "doorClosed";
						}
					}
					if (dungeon.cells[x][y + 1].type == "floor" && dungeon.cells[x + 1][y + 1].type == "floor" && dungeon.cells[x - 1][y + 1].type == "floor") {
						if (dungeon.cells[x - 1][y].type == "wall" && dungeon.cells[x + 1][y].type == "wall") {
							dungeon.cells[x][y].type = "doorClosed";
						}
					}
					if (dungeon.cells[x - 1][y].type == "floor" && dungeon.cells[x - 1][y - 1].type == "floor" && dungeon.cells[x - 1][y + 1].type == "floor") {
						if (dungeon.cells[x][y + 1].type == "wall" && dungeon.cells[x][y - 1].type == "wall") {
							dungeon.cells[x][y].type = "doorClosed";
						}
					}
				}
			}
		}
	}
	// create traps in random rooms at random locations
	if (dungeon.rooms.length > 0) {
		for (var i = 0; i < trapAmount; i++) {
			var roomIndex = getRandomInt(0, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			dungeon.cells[x][y].type = "trap";
		}
	}
	// create stairs up at the first room in the array
	if (dungeon.rooms.length > 0) {
		var x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
		var y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);
		dungeon.cells[x][y].type = "stairsUp";
	}
	// create stairs down at the last room in the array
	// this doesn't necessarily mean that stairs will generate far from each other, since the room positions are random
	if (dungeon.rooms.length > 0) {
		var x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
		var y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);
		dungeon.cells[x][y].type = "stairsDown";
	}
	// spawn entities in random rooms at random locations
	if (dungeon.rooms.length > 1) {
		for (var i = 0; i < monsterAmount; i++) {
			var roomIndex = getRandomInt(1, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			var monster = {
				id: game.id++,
				x: x,
				y: y,
				name: "",
				char: "",
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
				monster.name = "rat";
				monster.char = "r";
				monster.factions = [
					"monster",
					"rat"
				];
				monster.hostileFactions = [
					"player"
				];
			} else if (roll < 0.50) {
				monster.name = "slime";
				monster.char = "s";
				monster.factions = [
					"monster",
					"slime"
				];
				monster.hostileFactions = [
					"player"
				];
			} else if (roll < 0.75) {
				monster.name = "orc";
				monster.char = "o";
				monster.factions = [
					"monster",
					"orc"
				];
				monster.hostileFactions = [
					"player",
					"bugbear"
				];
			} else {
				monster.name = "bugbear";
				monster.char = "b";
				monster.factions = [
					"monster",
					"bugbear"
				];
				monster.hostileFactions = [
					"player",
					"orc"
				];
			}
			dungeon.entities.push(monster);
		}
	}
	// spawn chests in random rooms at random locations and give them loot
	if (dungeon.rooms.length > 0) {
		for (var i = 0; i < chestAmount; i++) {
			var roomIndex = getRandomInt(0, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			var chest = {
				x: x,
				y: y,
				loot: null
			}
			var roll = Math.random();
			if (roll < 0) {
				chest.loot = null;
			}
			else {
				var loot = {
					x: -1,
					y: -1,
					name: "",
					char: "",
					index: ""
				}
				var roll = Math.random();
				if (roll < 0.25) {
					loot.name = "sword";
					loot.char = "|";
				} else if (roll < 0.50) {
					loot.name = "spear";
					loot.char = "/";
				} else if (roll < 0.75) {
					loot.name = "shield";
					loot.char = ")";
				} else {
					loot.name = "bow";
					loot.char = "}";
				}
				chest.loot = loot;
			}
			dungeon.chests.push(chest);
		}
	}
	// add to the list
	game.dungeons.push(dungeon);
}
