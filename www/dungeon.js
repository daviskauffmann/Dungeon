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
*/

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var game = {
	player: {
		stats: {
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
			luck: 0
		},
		inventory: [],
		sight: 10
	},
	dungeons: [],
	level: 0,
	turn: 0,
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
changeLevel(0);
draw();
window.addEventListener("resize", draw);

function changeLevel(level) {
	game.level = level
	if (game.level == game.dungeons.length) {
		if (game.level == 0) {
			createTown();
			game.messages.push("welcome to the town");
		} else {
			createDungeon(50, 50, 20, 5, 15, true, 0.5, 3, 5, 1);
			game.messages.push("welcome to level " + (game.level + 1));
		}
	}
}

function createTown() {
	var dungeon = {
		width: 50,
		height: 50,
		cells: [],
		rooms: [],
		player: {
			x: 0,
			y: 0
		},
		creatures: [],
		corpses: [],
		chests: [],
		items: []
	}
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
	dungeon.player.x = Math.round(dungeon.width / 2);
	dungeon.player.y = Math.round(dungeon.height / 2);
	dungeon.cells[dungeon.player.x][dungeon.player.y].type = "stairsDown";
	game.dungeons.push(dungeon);
}

function createDungeon(width, height, roomAttempts, minRoomSize, maxRoomSize, preventOverlap, doorChance, trapAmount, creatureAmount, chestAmount) {
	var dungeon = {
		width: width,
		height: height,
		cells: [],
		rooms: [],
		// each dungeon keeps track of the player's position in that dungeon, rather than the player itself
		player: {
			x: 0,
			y: 0
		},
		creatures: [],
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
	// move player to the stairs up
	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			if (dungeon.cells[x][y].type == "stairsUp") {
				dungeon.player.x = x;
				dungeon.player.y = y;
				break;
			}
		}
	}
	// spawn creatures in random rooms at random locations
	if (dungeon.rooms.length > 1) {
		for (var i = 0; i < creatureAmount; i++) {
			var roomIndex = getRandomInt(1, dungeon.rooms.length);
			var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
			var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
			var creature = {
				x: x,
				y: y,
				name: "",
				char: "",
				sight: 10,
				level: game.level,
			}
			var roll = Math.random();
			if (roll < 0.3) {
				creature.name = "rat";
				creature.char = "r";
			} else if (roll < 0.6) {
				creature.name = "slime";
				creature.char = "s";
			} else {
				creature.name = "orc";
				creature.char = "o";
			}
			dungeon.creatures.push(creature);
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
	// add to list
	game.dungeons.push(dungeon);
}

function getCurrentDungeon() {
	return game.dungeons[game.level];
}

function getCreatureDungeon(creature) {
	return game.dungeons[creature.level];
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

function movePlayer(x, y) {
	var move = true;
	var ascend = false;
	var descend = false;
	if (x >= 0 && x < getCurrentDungeon().width && y >= 0 && y < getCurrentDungeon().height) {
		switch (getCurrentDungeon().cells[x][y].type) {
			case "wall":
				move = false;
				break;
			case "doorClosed":
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the door");
					getCurrentDungeon().cells[x][y].type = "doorOpen";
				}
				else {
					game.messages.push("the door won't budge");
				}
				break;
			case "trap":
				game.messages.push("you triggered a trap!");
				getCurrentDungeon().cells[x][y].type = "floor";
				break;
			case "stairsUp":
				if (game.level == 0) {
					document.location.reload();
				}
				else {
					game.messages.push("you ascend");
					ascend = true;
				}
				break;
			case "stairsDown":
				game.messages.push("you descend");
				descend = true;
				break;
		}
		for (var i = 0; i < getCurrentDungeon().creatures.length; i++) {
			if (x == getCurrentDungeon().creatures[i].x && y == getCurrentDungeon().creatures[i].y) {
				move = false;
				var roll = Math.random();
				if (roll < 0.5) {
					game.messages.push("you miss the " + getCurrentDungeon().creatures[i].name);
				} else {
					game.messages.push("you kill the " + getCurrentDungeon().creatures[i].name);
					var corpse = {
						x: x,
						y: y,
						name: getCurrentDungeon().creatures[i].name + " corpse",
						char: "%"
					}
					getCurrentDungeon().items.push(corpse);
					getCurrentDungeon().creatures.splice(i, 1);
				}
				break;
			}
		}
		for (var i = 0; i < getCurrentDungeon().chests.length; i++) {
			if (x == getCurrentDungeon().chests[i].x && y == getCurrentDungeon().chests[i].y) {
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the chest");
					var loot = getCurrentDungeon().chests[i].loot;
					if (loot == null) {
						game.messages.push("there is nothing inside");
					} else {
						if (game.player.inventory.length >= 26) {
							game.messages.push("inventory is full");
						} else {
							game.messages.push("you loot a " + loot.name);
							game.player.inventory.push(loot);
						}
					}
					getCurrentDungeon().chests.splice(i, 1);
				} else {
					game.messages.push("the chest won't open");
				}
				break;
			}
		}
		for (var i = 0; i < getCurrentDungeon().items.length; i++) {
			if (x == getCurrentDungeon().items[i].x && y == getCurrentDungeon().items[i].y) {
				game.messages.push("you see a " + getCurrentDungeon().items[i].name);
				//game.player.inventory.push(getCurrentDungeon().items[i]);
				//getCurrentDungeon().items.splice(i, 1);
				break;
			}
		}
	} else {
		move = false;
	}
	if (move) {
		getCurrentDungeon().player.x = x;
		getCurrentDungeon().player.y = y;
	}
	if (ascend) {
		changeLevel(game.level - 1);
	}
	if (descend) {
		changeLevel(game.level + 1);
	}
	tick();
}

// this gets called when the player takes an action
function tick() {
	// update all the creatures in all dungeons
	for (var i = 0; i < game.dungeons.length; i++) {
		for (var j = 0; j < game.dungeons[i].creatures.length; j++) {
			tickCreature(game.dungeons[i].creatures[j]);
		}
	}
	game.turn++;
	draw();
}

function tickCreature(creature) {
	var seePlayer = false;
	if (getCreatureDungeon(creature) == getCurrentDungeon()) {
		for (var i = 0; i < 360; i++) {
			raycast(creature.x, creature.y, creature.sight, i, function (x, y) {
				if (x == getCurrentDungeon().player.x && y == getCurrentDungeon().player.y) {
					seePlayer = true;
				}
			});
		}
	}
	if (seePlayer) {
		var path = pathfind(creature.x, creature.y, getCurrentDungeon().player.x, getCurrentDungeon().player.y, false);
		if (path != null) {
			next = path.pop();
			moveCreature(creature, next.x, next.y);
		}
	} else {
		var roll = Math.random();
		if (roll < 0.25) {
			moveCreature(creature, creature.x, creature.y - 1);
		} else if (roll < 0.5) {
			moveCreature(creature, creature.x + 1, creature.y);
		} else if (roll < 0.75) {
			moveCreature(creature, creature.x, creature.y + 1);
		} else {
			moveCreature(creature, creature.x - 1, creature.y);
		}
	}
}

function moveCreature(creature, x, y) {
	var move = true;
	if (x >= 0 && x < getCreatureDungeon(creature).width && y >= 0 && y < getCreatureDungeon(creature).height) {
		switch (getCreatureDungeon(creature).cells[x][y].type) {
			case "wall":
				move = false;
				break;
			case "doorClosed":
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					getCurrentDungeon().cells[x][y].type = "doorOpen";
				}
				break;
			case "stairsUp":
				move = false;
				break;
			case "stairsDown":
				move = false;
				break;
		}
		if (getCreatureDungeon(creature) == getCurrentDungeon()) {
			if (x == getCreatureDungeon(creature).player.x && y == getCreatureDungeon(creature).player.y) {
				move = false;
				var roll = Math.random();
				if (roll < 0.5) {
					game.messages.push("the " + creature.name + " misses you");
				}
				else {
					game.messages.push("the " + creature.name + " attacks you");
				}
			}
		}
		for (var i = 0; i < getCreatureDungeon(creature).creatures.length; i++) {
			if (getCreatureDungeon(creature).creatures[i] == creature) {
				continue;
			}
			if (x == getCreatureDungeon(creature).creatures[i].x && y == getCreatureDungeon(creature).creatures[i].y) {
				move = false;
				break;
			}
		}
		for (var i = 0; i < getCreatureDungeon(creature).chests.length; i++) {
			if (x == getCreatureDungeon(creature).chests[i].x && y == getCreatureDungeon(creature).chests[i].y) {
				move = false;
				break;
			}
		}
	} else {
		move = false;
	}
	if (move) {
		creature.x = x;
		creature.y = y;
	}
}

function draw() {
	// resize the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	// center the view on the player, while staying within the bounds of the dungeon
	view.width = Math.round(canvas.width / game.characterSize);
	view.height = Math.round(canvas.height / game.characterSize);
	view.x = getCurrentDungeon().player.x - Math.round(view.width / 2);
	view.y = getCurrentDungeon().player.y - Math.round(view.height / 2);
	if (view.x < 0) {
		view.x = 0;
	}
	if (view.x + view.width > getCurrentDungeon().width) {
		view.x = getCurrentDungeon().width - view.width;
	}
	if (view.y < 0) {
		view.y = 0;
	}
	if (view.y + view.height > getCurrentDungeon().height) {
		view.y = getCurrentDungeon().height - view.height;
	}
	// reset visibility
	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x >= 0 && x < getCurrentDungeon().width && y >= 0 && y < getCurrentDungeon().height) {
				getCurrentDungeon().cells[x][y].visible = false;
			}
		}
	}
	// sends out rays to check visibility
	for (var i = 0; i < 360; i++) {
		raycast(getCurrentDungeon().player.x, getCurrentDungeon().player.y, game.player.sight, i, function (x, y) {
			getCurrentDungeon().cells[x][y].discovered = true;
			getCurrentDungeon().cells[x][y].visible = true;
		});
	}
	// draw the cells within the view
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x >= 0 && x < getCurrentDungeon().width && y >= 0 && y < getCurrentDungeon().height) {
				ctx.font = game.characterSize + "px mono";
				ctx.fillStyle = "#fff";
				ctx.globalAlpha = 1;
				// draw player
				if (x == getCurrentDungeon().player.x && y == getCurrentDungeon().player.y) {
					ctx.fillText("@", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
					continue;
				}
				// draw objects only if the current cell is visible
				if (getCurrentDungeon().cells[x][y].visible) {
					// creatures
					var creature = false;
					for (var i = 0; i < getCurrentDungeon().creatures.length; i++) {
						if (x == getCurrentDungeon().creatures[i].x && y == getCurrentDungeon().creatures[i].y) {
							ctx.fillText(getCurrentDungeon().creatures[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							creature = true;
						}
					}
					if (creature) {
						continue;
					}
					// chests
					var chest = false;
					for (var i = 0; i < getCurrentDungeon().chests.length; i++) {
						if (x == getCurrentDungeon().chests[i].x && y == getCurrentDungeon().chests[i].y) {
							ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							chest = true;
						}
					}
					if (chest) {
						continue;
					}
					var item = false;
					for (var i = 0; i < getCurrentDungeon().items.length; i++) {
						if (x == getCurrentDungeon().items[i].x && y == getCurrentDungeon().items[i].y) {
							ctx.fillText(getCurrentDungeon().items[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
							item = true;
						}
					}
					if (item) {
						continue;
					}
				}
				// draw the environment
				if (getCurrentDungeon().cells[x][y].visible || getCurrentDungeon().cells[x][y].discovered) {
					if (getCurrentDungeon().cells[x][y].visible) {
						ctx.globalAlpha = 1;
					} else if (getCurrentDungeon().cells[x][y].discovered) {
						ctx.globalAlpha = 0.25;
					}
					ctx.fillStyle = "#fff";
					switch (getCurrentDungeon().cells[x][y].type) {
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
	ctx.fillText("Level:" + (game.level + 1) + " " + "Turn:" + game.turn, 0, canvas.height);
	// menus
	if (ui.mode.includes("inventory")) {
		for (var i = 0; i < game.player.inventory.length; i++) {
			game.player.inventory[i].index = String.fromCharCode(97 + i);
		}
		ctx.fillStyle = "#000";
		ctx.fillRect(canvas.width - game.characterSize * 10, 0, game.characterSize * 10, game.player.inventory.length * 26);
		ctx.fillStyle = "#fff";
		for (var i = 0; i < game.player.inventory.length; i++) {
			ctx.fillText(game.player.inventory[i].index + ") " + game.player.inventory[i].name + (game.player.inventory[i].equipped ? " (equipped)" : ""), canvas.width - (game.characterSize * 10), (i + 1) * game.characterSize);
		}
	}
	if (ui.mode == "character") {
		ctx.fillStyle = "#000";
		ctx.fillRect(canvas.width - game.characterSize * 10, 0, game.characterSize * 10, game.characterSize * 10);
		ctx.fillStyle = "#fff";
		ctx.fillText("Health: " + game.player.stats.health, canvas.width - (game.characterSize * 10), game.characterSize);
		ctx.fillText("Mana: " + game.player.stats.mana, canvas.width - (game.characterSize * 10), game.characterSize * 2);
	}
}
