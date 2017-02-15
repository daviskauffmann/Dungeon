var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
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

function draw() {
	var player = getPlayer();
	var maxWidth = window.innerWidth;
	var maxHeight = window.innerHeight;
	// resize the canvas
	canvas.width = maxWidth;
	canvas.height = maxHeight;
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
				game.dungeons[player.level].cells[x][y].visible = true;
			}
		}
	}
	// sends out rays to check visibility
	for (var dir = 0; dir < 360; dir++) {
		raycast(game.dungeons[player.level], player.x, player.y, player.stats.sight, dir, function (x, y) {
			game.dungeons[player.level].cells[x][y].discovered = true;
			game.dungeons[player.level].cells[x][y].visible = true;
		});
	}
	// draw the cells within the view
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = game.characterSize + "px mono";
	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x >= 0 && x < game.dungeons[player.level].width && y >= 0 && y < game.dungeons[player.level].height) {
				ctx.fillStyle = "#fff";
				ctx.globalAlpha = 1;
				// calculate current cell coordinate on the screen
				var screenX = (x - view.x) * game.characterSize;
				var screenY = (y - view.y + 1) * game.characterSize;
				// draw objects only if the current cell is visible
				if (game.dungeons[player.level].cells[x][y].visible) {
					// entities
					var entity = false;
					for (var i = 0; i < game.dungeons[player.level].entities.length; i++) {
						if (x == game.dungeons[player.level].entities[i].x && y == game.dungeons[player.level].entities[i].y) {
							ctx.fillText(game.dungeons[player.level].entities[i].char, screenX, screenY);
							entity = true;
							break;
						}
					}
					if (entity) {
						continue;
					}
					// chests
					var chest = false;
					for (var i = 0; i < game.dungeons[player.level].chests.length; i++) {
						if (x == game.dungeons[player.level].chests[i].x && y == game.dungeons[player.level].chests[i].y) {
							ctx.fillText("~", screenX, screenY);
							chest = true;
							break;
						}
					}
					if (chest) {
						continue;
					}
					var item = false;
					for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
						if (x == game.dungeons[player.level].items[i].x && y == game.dungeons[player.level].items[i].y) {
							ctx.fillText(game.dungeons[player.level].items[i].char, screenX, screenY);
							item = true;
							break;
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
							ctx.fillText(" ", screenX, screenY);
							break;
						case "floor":
							ctx.fillText(".", screenX, screenY);
							break;
						case "grass":
							ctx.fillStyle = "#50ff50";
							ctx.fillText(".", screenX, screenY);
							break;
						case "wall":
							ctx.fillText("#", screenX, screenY);
							break;
						case "doorClosed":
							ctx.fillText("+", screenX, screenY);
							break;
						case "doorOpen":
							ctx.fillText("-", screenX, screenY);
							break;
						case "stairsUp":
							ctx.fillText("<", screenX, screenY);
							break;
						case "stairsDown":
							ctx.fillText(">", screenX, screenY);
							break;
						case "trap":
							ctx.fillText("^", screenX, screenY);
							break;
					}
				}
			}
		}
	}
	// messages and level info
	ctx.fillStyle = "#fff";
	ctx.globalAlpha = 1;
	ctx.fillText(game.messages[game.messages.length - 5], 0, game.characterSize);
	ctx.fillText(game.messages[game.messages.length - 4], 0, game.characterSize * 2);
	ctx.fillText(game.messages[game.messages.length - 3], 0, game.characterSize * 3);
	ctx.fillText(game.messages[game.messages.length - 2], 0, game.characterSize * 4);
	ctx.fillText(game.messages[game.messages.length - 1], 0, game.characterSize * 5);
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
