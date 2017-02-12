/*
TODO
    inventory
        display list of items
            top left
        assign letters to each item
            thus, limit of 26 (uppercase? 52?)
        chatbox that takes in commands?
        rather than a chatbox, it could be that each command in the game is a letter on the keyboard
        e.g. if the user wants to drop an item at letter f, the flow is
            d (bringing up the inventory) > f (dropping the item), or
            i > d > f, or if doing the chatbox method
            #drop f, where pressing i will show the user what items are what
        upon consideration, i will go with the second option
    items
        decorator pattern?
            each item will be decorated with commands that can be performed on it
            e.g. a potion will have (d, s, q, t, p)
            it would probably be better to predefine certain item types
                weapon
                armor
                potion
                scroll
            each type would have commands associated with them
            an individual item would fall under some type category
            this makes random item generation easy
            if the user tries to drink (q) an item at slot a, the command would be i > q > a
                if the item is a potion, drink it
                if not, the action fails
        stacking?
            when items are added to the inventory, identical items are stacked
            each item will need an amount variable
                when removing an item, simply decrement the amount
                if amount is 0, splice the item from the inventory
            splitting stacks?
                it is probably unecessary for the user to be able to split stacks
            stack limit?
                could be limited or unlimited
                ultimately, a game design decision, not a technical one
    RPG elements
        stats
            health
                reaches 0, character death
            energy
                affects all skills
                damages health if too low for too long
                can be restored with food
                decreased through movement and combat
            mana
                used for casting learned spells

            stamina
                max health
            endurance
                max energy
            attunement
                max mana
            resistance
                resistance to all damage
            strength
                physical damage
            intelligence
                magic damage
                scroll and potion effectiveness
            avoidance
                avoid all damage chance
            precision
                critical damage chance
            charisma
                roleplay
                affects prices at merchants
            luck
                affects all skills
                affects item find
	entity system
		redefine all alive things (including the player) as entities
		entities can have relationships with other entities
		this way, monsters can be defined as entities that have a hostile relationship with the player
			this is flexible because some monsters can then be hostile towards other monsters
			these hostilities could be added at creation, and also changed during the game
			e.g. an orc (part of the orc faction) can be hostile towards the goblin faction
				but if a bugbear makes the orc mad somehow (such as blocking a doorway), the orc can add that specific bugbear entity to its hostileEntities array 
		thus, each entity will have 3 arrays
			factions = factions this entity belongs to
			hostileFactions = factions this entity will attack
			hostileEntities = specific entities this entity will attack
		playerEntity {
			factions: [
				"player"
			]
			hostileFactions: [
				"monster"
			]
			hostileEntities: [];
		}
		orcEntity {
			factions: [
				"monster",
				"orc"
			]
			hostileFactions: [
				"player",
				"goblin"
			]
			hostileEntities: [
				bugbearEntity (this is a reference to a specific object)
					referencing objects like this can make saving a loading tough
					perhaps give all entities a unique ID, and hostile entities just hold the ID
			]
		}
		this will allow for easy addition of townsfolk and henchmen
		currently, combat checks for the player look like this
		for (var i = 0; i < creatures.length; i++) {
			if (creature[i].x == player.intendedX && creature[i].y == player.intendedY) {
				combat
			}
		}
		with the new system, it would be like
		for (var i = 0; i < entities.length; i++) {
			if (entities[i].x == player.intendedX && entities[i].y == player.intendedY) {
				if (canFight(player, entities[i]) == 0) {
					combat
				}
			}
		}
		canFight(entity1, entity2) {
			if (entity1.hostileFactions.contains(entity2)) {
				return true;
			}
			if (entity1.hostileEntities.contains(entity2)) {
				return true;
			}
			return false;
		}
		the player could have a command to add an entity to their hostileEntities array
			this would be so they could attack otherwise friendly townsfolk if they want
			perhaps if enough townsfold are killed, all the townsfolk will add the player to their hostileFactions arrays
			this could even be applied to the orc/bugbear example
				when the orc kills the bugbear (or the other way around), all the orcs could add "bugbear" to their hostileFactions and vice versa
				this would cause dynamic wars to occur in the dungeon
		function Entity() {
			id: ++game.id,
			x: 0,
			y: 0,
			name: "",
			char: "",
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
			factions: [],
			hostileFactions: [],
			hostileEntities: []
		}
	combine movePlayer() and moveEntity() into the same function
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var game = {
	id: 1,
	dungeons: [],
	turn: 0,
	stopTime: false,
	characterSize: 24,
	messages: []
}
var view = {
	x: 0,
	y: 0,
	width: 0,
	height: 0
}
var ui = {
	mode: "",
	inventorySwapFirst: null,
	inventorySwapSecond: null
}
createTown();
draw();
window.addEventListener("resize", draw);

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

function changeLevel(entity, level, cellType) {
	if (level == game.dungeons.length) {
		createDungeon(50, 50, 20, 5, 15, true, 0.5, 3, 10, 1);
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
	game.messages.push(entity.name + " has moved to level " + (entity.level));
}

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
				x: x,
				y: y,
				type: "grass",
				discovered: false,
				visible: false
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
		x: 0,
		y: 0,
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
	// move the player to the spawnpoint
	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			if (dungeon.cells[x][y].type == "stairsDown") {
				player.x = x;
				player.y = y;
				break;
			}
		}
	}
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
				x: x,
				y: y,
				type: "empty",
				discovered: false,
				visible: false
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
			if (roll < 0.3) {
				monster.name = "rat";
				monster.char = "r";
				monster.factions = [
					"monster",
					"rat"
				];
				monster.hostileFactions = [
					"player"
				];
			} else if (roll < 0.6) {
				monster.name = "slime";
				monster.char = "s";
				monster.factions = [
					"monster",
					"slime"
				];
				monster.hostileFactions = [
					"player"
				];
			} else {
				monster.name = "orc";
				monster.char = "o";
				monster.factions = [
					"monster",
					"orc"
				];
				monster.hostileFactions = [
					"player",
					"rat",
					"slime"
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
	console.log(dungeon);
	return dungeon;
}

// this gets called when the player takes an action
function tick() {
	if (!game.stopTime) {
		// update all the entities in all dungeons
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
	draw();
}

function tickEntity(entity) {
	var targets = [];
	for (var i = 0; i < 360; i++) {
		raycast(game.dungeons[entity.level], entity.x, entity.y, entity.stats.sight, i, function (x, y) {
			for (var j = 0; j < game.dungeons[entity.level].entities.length; j++) {
				if (game.dungeons[entity.level].entities[j] == entity) {
					continue;
				}
				if (arrayContains(targets, game.dungeons[entity.level].entities[j])) {
					continue;
				}
				if (game.dungeons[entity.level].entities[j].x == x && game.dungeons[entity.level].entities[j].y == y) {
					var hostile = false;
					for (var k = 0; k < game.dungeons[entity.level].entities[j].factions.length; k++) {
						if (arrayContains(entity.hostileFactions, game.dungeons[entity.level].entities[j].factions[k])) {
							hostile = true;
							break;
						}
					}
					if (hostile) {
						targets.push(game.dungeons[entity.level].entities[j]);
						return true;
					}
				}
			}
		});
	}
	if (targets.length > 0) {
		var target = targets[0];
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
			case "wall":
				move = false;
				break;
			case "doorClosed":
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.dungeons[entity.level].cells[x][y].type = "doorOpen";
				}
				break;
			case "stairsUp":
				if (entity.level == 0) {
					break;
				}
				else {
					game.messages.push(entity.name + " ascends");
					ascend = true;
				}
				break;
			case "stairsDown":
				game.messages.push(entity.name + " descends");
				descend = true;
				break;
		}
		for (var i = 0; i < game.dungeons[entity.level].entities.length; i++) {
			if (game.dungeons[entity.level].entities[i] == entity) {
				continue;
			}
			if (x == game.dungeons[entity.level].entities[i].x && y == game.dungeons[entity.level].entities[i].y) {
				move = false;
				var hostile = false;
				for (var j = 0; j < game.dungeons[entity.level].entities[i].factions.length; j++) {
					if (arrayContains(entity.hostileFactions, game.dungeons[entity.level].entities[i].factions[j])) {
						hostile = true;
						break;
					}
				}
				if (hostile) {
					var roll = Math.random();
					if (roll < 0.5) {
						game.messages.push("the " + entity.name + " misses the " + game.dungeons[entity.level].entities[i].name);
					} else {
						// FIXME
						if (game.dungeons[entity.level].entities[i].id == 0) {
							break;
						}
						game.messages.push("the " + entity.name + " kills the " + game.dungeons[entity.level].entities[i].name);
						var corpse = {
							x: x,
							y: y,
							name: game.dungeons[entity.level].entities[i].name + " corpse",
							char: "%",
							index: ""
						}
						game.dungeons[entity.level].items.push(corpse);
						game.dungeons[entity.level].entities.splice(i, 1);
					}
					break;
				}
			}
		}
	} else {
		move = false;
	}
	if (move) {
		entity.x = x;
		entity.y = y;
	}
	if (ascend) {
		changeLevel(entity, entity.level - 1, "stairsDown");
	}
	if (descend) {
		changeLevel(entity, entity.level + 1, "stairsUp");
	}
}

function getNextMessage() {
	if (game.messages.length > 0) {
		var message = game.messages.shift();
		console.log(message);
		return message;
	} else {
		return "";
	}
}

function draw() {
	var player = getPlayer();
	if (player == null) {
		return;
	}
	// resize the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	// center the view on the player, while staying within the bounds of the dungeon
	view.width = Math.round(canvas.width / game.characterSize);
	view.height = Math.round(canvas.height / game.characterSize);
	view.x = player.x - Math.round(view.width / 2);
	view.y = player.y - Math.round(view.height / 2);
	if (view.x < 0) {
		view.x = 0;
	}
	if (view.x + view.width > game.dungeons[player.level].width) {
		view.x = game.dungeons[player.level].width - view.width;
	}
	if (view.y < 0) {
		view.y = 0;
	}
	if (view.y + view.height > game.dungeons[player.level].height) {
		view.y = game.dungeons[player.level].height - view.height;
	}
	// reset visibility
	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x >= 0 && x < game.dungeons[player.level].width && y >= 0 && y < game.dungeons[player.level].height) {
				game.dungeons[player.level].cells[x][y].visible = false;
			}
		}
	}
	// sends out rays to check visibility
	for (var i = 0; i < 360; i++) {
		raycast(game.dungeons[player.level], player.x, player.y, player.stats.sight, i, function (x, y) {
			game.dungeons[player.level].cells[x][y].discovered = true;
			game.dungeons[player.level].cells[x][y].visible = true;
		});
	}
	// draw the cells within the view
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x >= 0 && x < game.dungeons[player.level].width && y >= 0 && y < game.dungeons[player.level].height) {
				ctx.font = game.characterSize + "px mono";
				ctx.fillStyle = "#fff";
				ctx.globalAlpha = 1;
				// draw player
				if (x == player.x && y == player.y) {
					ctx.fillText(player.char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
					continue;
				}
				// draw objects only if the current cell is visible
				if (game.dungeons[player.level].cells[x][y].visible) {
					// entities
					var entity = false;
					for (var i = 0; i < game.dungeons[player.level].entities.length; i++) {
						if (x == game.dungeons[player.level].entities[i].x && y == game.dungeons[player.level].entities[i].y) {
							ctx.fillText(game.dungeons[player.level].entities[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							entity = true;
						}
					}
					if (entity) {
						continue;
					}
					// chests
					var chest = false;
					for (var i = 0; i < game.dungeons[player.level].chests.length; i++) {
						if (x == game.dungeons[player.level].chests[i].x && y == game.dungeons[player.level].chests[i].y) {
							ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							chest = true;
						}
					}
					if (chest) {
						continue;
					}
					var item = false;
					for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
						if (x == game.dungeons[player.level].items[i].x && y == game.dungeons[player.level].items[i].y) {
							ctx.fillText(game.dungeons[player.level].items[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							item = true;
						}
					}
					if (item) {
						continue;
					}
				}
				// draw the environment
				if (game.dungeons[player.level].cells[x][y].visible || game.dungeons[player.level].cells[x][y].discovered) {
					if (game.dungeons[player.level].cells[x][y].visible) {
						ctx.globalAlpha = 1;
					} else if (game.dungeons[player.level].cells[x][y].discovered) {
						ctx.globalAlpha = 0.25;
					}
					ctx.fillStyle = "#fff";
					switch (game.dungeons[player.level].cells[x][y].type) {
						case "empty":
							ctx.fillText(" ", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "floor":
							ctx.fillText(".", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "grass":
							ctx.fillStyle = "#00ff00";
							ctx.fillText(".", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "wall":
							ctx.fillText("#", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "doorClosed":
							ctx.fillText("+", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "doorOpen":
							ctx.fillText("-", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "stairsUp":
							ctx.fillText("<", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "stairsDown":
							ctx.fillText(">", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
						case "trap":
							ctx.fillText("^", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							break;
					}
				}
			}
		}
	}
	// messages and level info
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.fillText(getNextMessage(), 0, game.characterSize);
	ctx.fillText(getNextMessage(), 0, game.characterSize * 2);
	ctx.fillText("Level:" + (player.level + 1) + " " + "Turn:" + game.turn, 0, canvas.height);
	// menus
	if (ui.mode.includes("inventory")) {
		for (var i = 0; i < player.inventory.length; i++) {
			player.inventory[i].index = String.fromCharCode(97 + i);
		}
		ctx.fillStyle = "#000";
		ctx.fillRect(canvas.width - game.characterSize * 10, 0, game.characterSize * 10, player.inventory.length * 26);
		ctx.fillStyle = "#fff";
		for (var i = 0; i < player.inventory.length; i++) {
			ctx.fillText(player.inventory[i].index + ") " + player.inventory[i].name + (player.inventory[i].equipped ? " (equipped)" : ""), canvas.width - (game.characterSize * 10), (i + 1) * game.characterSize);
		}
	}
	if (ui.mode == "character") {
		ctx.fillStyle = "#000";
		ctx.fillRect(canvas.width - game.characterSize * 10, 0, game.characterSize * 10, game.characterSize * 10);
		ctx.fillStyle = "#fff";
		ctx.fillText("Health: " + player.stats.health, canvas.width - (game.characterSize * 10), game.characterSize);
		ctx.fillText("Mana: " + player.stats.mana, canvas.width - (game.characterSize * 10), game.characterSize * 2);
	}
}
