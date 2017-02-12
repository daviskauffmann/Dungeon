document.addEventListener("keydown", function (e) {
	var player = getPlayer();
	if (player == null) {
		return;
	}
	switch (ui.mode) {
		case "":
			if (e.key == "ArrowUp") {
				movePlayer(player.x, player.y - 1);
				tick();
			}
			if (e.key == "ArrowRight") {
				movePlayer(player.x + 1, player.y);
				tick();
			}
			if (e.key == "ArrowDown") {
				movePlayer(player.x, player.y + 1);
				tick();
			}
			if (e.key == "ArrowLeft") {
				movePlayer(player.x - 1, player.y);
				tick();
			}
			if (e.key == ".") {
				tick();
			}
			if (e.key == "g") {
				for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
					if (player.x == game.dungeons[player.level].items[i].x && player.y == game.dungeons[player.level].items[i].y) {
						game.messages.push("you pick up a " + game.dungeons[player.level].items[i].name);
						player.inventory.push(game.dungeons[player.level].items[i]);
						game.dungeons[player.level].items.splice(i, 1);
						draw();
						break;
					}
				}
			}
			if (e.key == "c") {
				if (game.dungeons[player.level].cells[player.x][player.y].type == "doorOpen") {
					game.messages.push("you close the door");
					game.dungeons[player.level].cells[player.x][player.y].type = "doorClosed"
					draw();
				}
			}
			if (e.key == "i") {
				if (player.inventory.length > 0) {
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
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index == e.key) {
					game.messages.push("you drop a " + player.inventory[i].name);
					player.inventory[i].x = player.x;
					player.inventory[i].y = player.y;
					game.dungeons[player.level].items.push(player.inventory[i]);
					player.inventory.splice(i, 1);
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
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index == e.key) {
					game.messages.push("you equip a " + player.inventory[i].name);
					player.inventory[i].equipped = true;
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
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index == e.key) {
					game.messages.push("you unequip a " + player.inventory[i].name);
					player.inventory[i].equipped = false;
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
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index == e.key) {
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
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index == e.key) {
					ui.inventorySwapSecond = i;
					game.messages.push("you swap the " + player.inventory[ui.inventorySwapFirst].name + " with the " + player.inventory[ui.inventorySwapSecond].name);
					var t = player.inventory[ui.inventorySwapFirst];
					player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
					player.inventory[ui.inventorySwapSecond] = t;
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
	/*if (e.key == "1") {
		localStorage.setItem("game", JSON.stringify(game));
		console.log(JSON.stringify(game));
		game.messages.push("game saved");
	}
	if (e.key == "2") {
		game = JSON.parse(localStorage.getItem("game"));
		console.log(game);
		game.messages.push("game loaded");
		draw();
	}*/
	if (e.key == " ") {
		game.stopTime = !game.stopTime;
	}
});

function movePlayer(x, y) {
	var player = getPlayer();
	if (player == null) {
		return;
	}
	var move = true;
	var ascend = false;
	var descend = false;
	if (x >= 0 && x < game.dungeons[player.level].width && y >= 0 && y < game.dungeons[player.level].height) {
		switch (game.dungeons[player.level].cells[x][y].type) {
			case "wall":
				move = false;
				break;
			case "doorClosed":
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the door");
					game.dungeons[player.level].cells[x][y].type = "doorOpen";
				}
				else {
					game.messages.push("the door won't budge");
				}
				break;
			case "trap":
				game.messages.push("you triggered a trap!");
				game.dungeons[player.level].cells[x][y].type = "floor";
				break;
			case "stairsUp":
				if (player.level == 0) {
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
		for (var i = 0; i < game.dungeons[player.level].entities.length; i++) {
			if (x == game.dungeons[player.level].entities[i].x && y == game.dungeons[player.level].entities[i].y) {
				move = false;
				var friendly = true;
				for (var j = 0; j < game.dungeons[player.level].entities[i].factions.length; j++) {
					if (arrayContains(player.hostileFactions, game.dungeons[player.level].entities[i].factions[j])) {
						friendly = false;
					}
				}
				if (friendly) {
					continue;
				}
				var roll = Math.random();
				if (roll < 0.5) {
					game.messages.push("you miss the " + game.dungeons[player.level].entities[i].name);
				} else {
					game.messages.push("you kill the " + game.dungeons[player.level].entities[i].name);
					var corpse = {
						x: x,
						y: y,
						name: game.dungeons[player.level].entities[i].name + " corpse",
						char: "%",
						index: ""
					}
					game.dungeons[player.level].items.push(corpse);
					game.dungeons[player.level].entities.splice(i, 1);
				}
				break;
			}
		}
		for (var i = 0; i < game.dungeons[player.level].chests.length; i++) {
			if (x == game.dungeons[player.level].chests[i].x && y == game.dungeons[player.level].chests[i].y) {
				move = false;
				var roll = Math.random();
				if (roll > 0.5) {
					game.messages.push("you open the chest");
					var loot = game.dungeons[player.level].chests[i].loot;
					if (loot == null) {
						game.messages.push("there is nothing inside");
					} else {
						if (player.inventory.length >= 26) {
							game.messages.push("inventory is full");
						} else {
							game.messages.push("you loot a " + loot.name);
							player.inventory.push(loot);
						}
					}
					game.dungeons[player.level].chests.splice(i, 1);
				} else {
					game.messages.push("the chest won't open");
				}
				break;
			}
		}
		for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
			if (x == game.dungeons[player.level].items[i].x && y == game.dungeons[player.level].items[i].y) {
				game.messages.push("you see a " + game.dungeons[player.level].items[i].name);
				break;
			}
		}
	} else {
		move = false;
	}
	if (move) {
		player.x = x;
		player.y = y;
	}
	if (ascend) {
		changeLevel(player, player.level - 1, "stairsDown");
	}
	if (descend) {
		changeLevel(player, player.level + 1, "stairsUp");
	}
}

/*document.addEventListener("mousedown", function (e) {
	var x = view.x + Math.floor(e.x / game.characterSize);
	var y = view.y + Math.floor(e.y / game.characterSize);
	var path = pathfind(game.dungeons[player.level], player.x, player.y, x, y);
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
	var path = pathfind(game.dungeons[player.level], player.x, player.y, x, y);
	if (path != null && path.length > 0) {
		next = path.pop();
		movePlayer(next.x, next.y);
		tick();
	}
});*/
