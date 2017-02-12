document.addEventListener("keydown", function (e) {
	switch (ui.mode) {
		case "":
			if (e.key == "ArrowUp") {
				movePlayer(game.dungeons[game.level].player.x, game.dungeons[game.level].player.y - 1);
				tick();
			}
			if (e.key == "ArrowRight") {
				movePlayer(game.dungeons[game.level].player.x + 1, game.dungeons[game.level].player.y);
				tick();
			}
			if (e.key == "ArrowDown") {
				movePlayer(game.dungeons[game.level].player.x, game.dungeons[game.level].player.y + 1);
				tick();
			}
			if (e.key == "ArrowLeft") {
				movePlayer(game.dungeons[game.level].player.x - 1, game.dungeons[game.level].player.y);
				tick();
			}
			if (e.key == ".") {
				tick();
			}
			if (e.key == "g") {
				for (var i = 0; i < game.dungeons[game.level].items.length; i++) {
					if (game.dungeons[game.level].player.x == game.dungeons[game.level].items[i].x && game.dungeons[game.level].player.y == game.dungeons[game.level].items[i].y) {
						game.messages.push("you pick up a " + game.dungeons[game.level].items[i].name);
						game.player.inventory.push(game.dungeons[game.level].items[i]);
						game.dungeons[game.level].items.splice(i, 1);
						draw();
						break;
					}
				}
			}
			if (e.key == "c") {
				if (game.dungeons[game.level].cells[game.dungeons[game.level].player.x][game.dungeons[game.level].player.y].type == "doorOpen") {
					game.messages.push("you close the door");
					game.dungeons[game.level].cells[game.dungeons[game.level].player.x][game.dungeons[game.level].player.y].type = "doorClosed"
					draw();
				}
			}
			if (e.key == "i") {
				if (game.player.inventory.length > 0) {
					ui.mode = "inventory";
					draw();
				}
			}
			if (e.key == "o") {
				ui.mode = "character";
				draw();
			}
			/*if (e.key == "i") {
            	ui.mode = "spellbook";
            	draw();
            }*/
			break;
		case "inventory":
			if (e.key == "i") {
				ui.mode = "";
				draw();
			}
			if (e.key == "d") {
				game.messages.push("select item to drop");
				game.messages.push("press space to cancel");
				ui.mode = "inventory_drop";
				draw();
			}
			if (e.key == "e") {
				game.messages.push("select item to equip");
				game.messages.push("press space to cancel");
				ui.mode = "inventory_equip";
				draw();
			}
			if (e.key == "u") {
				game.messages.push("select item to unequip");
				game.messages.push("press space to cancel");
				ui.mode = "inventory_unequip";
				draw();
			}
			if (e.key == "s") {
				game.messages.push("select first item to swap");
				game.messages.push("press space to cancel");
				ui.mode = "inventory_swapFirst";
				draw();
			}
			break;
		case "inventory_drop":
			for (var i = 0; i < game.player.inventory.length; i++) {
				if (game.player.inventory[i].index == e.key) {
					game.messages.push("you drop a " + game.player.inventory[i].name);
					game.player.inventory[i].x = game.dungeons[game.level].player.x;
					game.player.inventory[i].y = game.dungeons[game.level].player.y;
					game.dungeons[game.level].items.push(game.player.inventory[i]);
					game.player.inventory.splice(i, 1);
					ui.mode = "";
					draw();
				}
			}
			if (e.key == " ") {
				ui.mode = "";
				draw();
			}
			break;
		case "inventory_equip":
			for (var i = 0; i < game.player.inventory.length; i++) {
				if (game.player.inventory[i].index == e.key) {
					game.messages.push("you equip a " + game.player.inventory[i].name);
					game.player.inventory[i].equipped = true;
					ui.mode = "";
					draw();
				}
			}
			if (e.key == " ") {
				ui.mode = "";
				draw();
			}
			break;
		case "inventory_unequip":
			for (var i = 0; i < game.player.inventory.length; i++) {
				if (game.player.inventory[i].index == e.key) {
					game.messages.push("you unequip a " + game.player.inventory[i].name);
					game.player.inventory[i].equipped = false;
					ui.mode = "";
					draw();
				}
			}
			if (e.key == " ") {
				ui.mode = "";
				draw();
			}
			break;
		case "inventory_swapFirst":
			for (var i = 0; i < game.player.inventory.length; i++) {
				if (game.player.inventory[i].index == e.key) {
					ui.inventorySwapFirst = i;
					game.messages.push("select second item to swap");
					game.messages.push("press space to cancel");
					ui.mode = "inventory_swapSecond";
					draw();
				}
			}
			if (e.key == " ") {
				ui.mode = "";
				draw();
			}
			break;
		case "inventory_swapSecond":
			for (var i = 0; i < game.player.inventory.length; i++) {
				if (game.player.inventory[i].index == e.key) {
					ui.inventorySwapSecond = i;
					game.messages.push("you swap the " + game.player.inventory[ui.inventorySwapFirst].name + " with the " + game.player.inventory[ui.inventorySwapSecond].name);
					var t = game.player.inventory[ui.inventorySwapFirst];
					game.player.inventory[ui.inventorySwapFirst] = game.player.inventory[ui.inventorySwapSecond];
					game.player.inventory[ui.inventorySwapSecond] = t;
					ui.mode = "";
					draw();
				}
			}
			if (e.key == " ") {
				ui.mode = "";
				draw();
			}
			break;
		case "character":
			if (e.key == "o") {
				ui.mode = "";
				draw();
			}
			break;
	}
	if (e.key == "1") {
		//localStorage.setItem("game", JSON.stringify(game));
		console.log(JSON.stringify(game));
		game.messages.push("game saved");
	}
	if (e.key == "2") {
		//game = JSON.parse(localStorage.getItem("game"));
		game.messages.push("game loaded");
		changeLevel(game.level);
	}
});

function movePlayer(x, y) {
	var move = true;
	var ascend = false;
	var descend = false;
	if (x >= 0 && x < game.dungeons[game.level].width && y >= 0 && y < game.dungeons[game.level].height) {
		switch (game.dungeons[game.level].cells[x][y].type) {
			case "wall":
				move = false;
				break;
			case "doorClosed":
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the door");
					game.dungeons[game.level].cells[x][y].type = "doorOpen";
				}
				else {
					game.messages.push("the door won't budge");
				}
				break;
			case "trap":
				game.messages.push("you triggered a trap!");
				game.dungeons[game.level].cells[x][y].type = "floor";
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
		for (var i = 0; i < game.dungeons[game.level].entities.length; i++) {
			if (x == game.dungeons[game.level].entities[i].x && y == game.dungeons[game.level].entities[i].y) {
				move = false;
				var friendly = true;
				for (var j = 0; j < game.dungeons[game.level].entities[i].factions.length; j++) {
					if (arrayContains(game.player.hostileFactions, game.dungeons[game.level].entities[i].factions[j])) {
						friendly = false;
					}
				}
				if (friendly) {
					continue;
				}
				var roll = Math.random();
				if (roll < 0.5) {
					game.messages.push("you miss the " + game.dungeons[game.level].entities[i].name);
				} else {
					game.messages.push("you kill the " + game.dungeons[game.level].entities[i].name);
					var corpse = {
						x: x,
						y: y,
						name: game.dungeons[game.level].entities[i].name + " corpse",
						char: "%",
						index: ""
					}
					game.dungeons[game.level].items.push(corpse);
					game.dungeons[game.level].entities.splice(i, 1);
				}
				break;
			}
		}
		for (var i = 0; i < game.dungeons[game.level].chests.length; i++) {
			if (x == game.dungeons[game.level].chests[i].x && y == game.dungeons[game.level].chests[i].y) {
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the chest");
					var loot = game.dungeons[game.level].chests[i].loot;
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
					game.dungeons[game.level].chests.splice(i, 1);
				} else {
					game.messages.push("the chest won't open");
				}
				break;
			}
		}
		for (var i = 0; i < game.dungeons[game.level].items.length; i++) {
			if (x == game.dungeons[game.level].items[i].x && y == game.dungeons[game.level].items[i].y) {
				game.messages.push("you see a " + game.dungeons[game.level].items[i].name);
				//game.player.inventory.push(game.dungeons[game.level].items[i]);
				//game.dungeons[game.level].items.splice(i, 1);
				break;
			}
		}
	} else {
		move = false;
	}
	if (move) {
		game.dungeons[game.level].player.x = x;
		game.dungeons[game.level].player.y = y;
	}
	if (ascend) {
		changeLevel(game.level - 1);
	}
	if (descend) {
		changeLevel(game.level + 1);
	}
}

document.addEventListener("mousedown", function (e) {
	var x = view.x + Math.floor(e.x / game.characterSize);
	var y = view.y + Math.floor(e.y / game.characterSize);
	var path = pathfind(game.dungeons[game.level], game.dungeons[game.level].player.x, game.dungeons[game.level].player.y, x, y);
	if (path != null && path.length > 0) {
		next = path.pop();
		movePlayer(next.x, next.y);
		tick();
	}
});

document.addEventListener("touchstart", function (e) {
	e.preventDefault();
	var x = view.x + Math.floor(e.touches[0].screenX / game.characterSize);
	var y = view.y + Math.floor(e.touches[0].screenY / game.characterSize);
	var path = pathfind(game.dungeons[game.level], game.dungeons[game.level].player.x, game.dungeons[game.level].player.y, x, y);
	if (path != null && path.length > 0) {
		next = path.pop();
		movePlayer(next.x, next.y);
		tick();
	}
});
