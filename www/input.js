document.addEventListener("keydown", function (e) {
	switch (ui.mode) {
		case "":
			if (e.key == "ArrowUp") {
				movePlayer(getCurrentDungeon().player.x, getCurrentDungeon().player.y - 1);
			}
			if (e.key == "ArrowRight") {
				movePlayer(getCurrentDungeon().player.x + 1, getCurrentDungeon().player.y);
			}
			if (e.key == "ArrowDown") {
				movePlayer(getCurrentDungeon().player.x, getCurrentDungeon().player.y + 1);
			}
			if (e.key == "ArrowLeft") {
				movePlayer(getCurrentDungeon().player.x - 1, getCurrentDungeon().player.y);
			}
			if (e.key == ".") {
				movePlayer(getCurrentDungeon().player.x, getCurrentDungeon().player.y);
			}
			if (e.key == "g") {
				for (var i = 0; i < getCurrentDungeon().items.length; i++) {
					if (getCurrentDungeon().player.x == getCurrentDungeon().items[i].x && getCurrentDungeon().player.y == getCurrentDungeon().items[i].y) {
						game.messages.push("you pick up a " + getCurrentDungeon().items[i].name);
						game.player.inventory.push(getCurrentDungeon().items[i]);
						getCurrentDungeon().items.splice(i, 1);
						draw();
						break;
					}
				}
			}
			if (e.key == "c") {
				if (getCurrentDungeon().cells[getCurrentDungeon().player.x][getCurrentDungeon().player.y].type == "doorOpen") {
					game.messages.push("you close the door");
					getCurrentDungeon().cells[getCurrentDungeon().player.x][getCurrentDungeon().player.y].type = "doorClosed"
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
					game.player.inventory[i].x = getCurrentDungeon().player.x;
					game.player.inventory[i].y = getCurrentDungeon().player.y;
					getCurrentDungeon().items.push(game.player.inventory[i]);
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
		localStorage.setItem("game", JSON.stringify(game));
		game.messages.push("game saved");
	}
	if (e.key == "2") {
		game = JSON.parse(localStorage.getItem("game"));
		game.messages.push("game loaded");
		changeLevel(game.level);
	}
});

document.addEventListener("mousedown", function (e) {
	var x = view.x + Math.floor(e.x / game.characterSize);
	var y = view.y + Math.floor(e.y / game.characterSize);
	var path = pathfind(getCurrentDungeon().player.x, getCurrentDungeon().player.y, x, y, true);
	if (path != null && path.length > 0) {
		next = path.pop();
		movePlayer(next.x, next.y);
	}
});

document.addEventListener("touchstart", function (e) {
	e.preventDefault();
	var x = view.x + Math.floor(e.touches[0].screenX / game.characterSize);
	var y = view.y + Math.floor(e.touches[0].screenY / game.characterSize);
	var path = pathfind(getCurrentDungeon().player.x, getCurrentDungeon().player.y, x, y, true);
	if (path != null && path.length > 0) {
		next = path.pop();
		movePlayer(next.x, next.y);
	}
});
