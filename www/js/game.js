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

var game = {
	id: 1,
	dungeons: [],
	turn: 0,
	characterSize: 24,
	messages: [],
	stopTime: false,
	ignoreFov: false
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
}

// eventually, i want each type of entity to have their own prototype
// these prototypes would implement a tick function which would be called instead of this
function tickEntity(entity) {
	var targets = [];
	for (var dir = 0; dir < 360; dir += 10) {
		raycast(game.dungeons[entity.level], entity.x, entity.y, entity.stats.sight, dir, function (x, y) {
			for (var i = 0; i < game.dungeons[entity.level].entities.length; i++) {
				if (game.dungeons[entity.level].entities[i] == entity) {
					continue;
				}
				if (arrayContains(targets, game.dungeons[entity.level].entities[i])) {
					continue;
				}
				if (game.dungeons[entity.level].entities[i].x == x && game.dungeons[entity.level].entities[i].y == y) {
					var hostile = false;
					for (var j = 0; j < game.dungeons[entity.level].entities[i].factions.length; j++) {
						if (arrayContains(entity.hostileFactions, game.dungeons[entity.level].entities[i].factions[j])) {
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
		game.messages.push("the " + entity.name + " spots a " + target.name);
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
					game.messages.push("the " + entity.name + " opens the door");
					game.dungeons[entity.level].cells[x][y].type = "doorOpen";
				} else {
					game.messages.push("the " + entity.name + " can't open the door");
				}
				break;
			case "stairsUp":
				game.messages.push(entity.name + " ascends");
				ascend = true;
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
			if (game.dungeons[entity.level].entities[i].x == x && game.dungeons[entity.level].entities[i].y == y) {
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
						for (var j = 0; j < game.dungeons[entity.level].entities[i].inventory.length; j++) {
							game.messages.push("the " + game.dungeons[entity.level].entities[i].name + " drops a " + game.dungeons[entity.level].entities[i].inventory[j].name);
							game.dungeons[entity.level].entities[i].inventory[j].x = x;
							game.dungeons[entity.level].entities[i].inventory[j].y = y;
							game.dungeons[entity.level].items.push(game.dungeons[entity.level].entities[i].inventory[j]);
						}
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
		for (var i = 0; i < game.dungeons[entity.level].chests.length; i++) {
			if (game.dungeons[entity.level].chests[i].x == x && game.dungeons[entity.level].chests[i].y == y) {
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("the " + entity.name + " opens the chest");
					var loot = game.dungeons[entity.level].chests[i].loot;
					if (loot == null) {
						game.messages.push("the " + entity.name + " sees nothing inside");
					} else {
						if (entity.inventory.length >= 26) {
							game.messages.push(entity.name + "'s inventory is full");
						} else {
							game.messages.push("the " + entity.name + " loots a " + loot.name);
							entity.inventory.push(loot);
						}
					}
					game.dungeons[entity.level].chests.splice(i, 1);
				} else {
					game.messages.push("the " + entity.name + " can't open the chest");
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
			game.messages.push("the " + entity.name + " sees a " + itemNames.join(", "));
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
	game.messages.push(entity.name + " has moved to level " + (entity.level));
}
