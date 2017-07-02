function draw() {
	var player = getPlayer();

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	view.width = Math.round(canvas.width / view.characterSize);
	view.height = Math.round(canvas.height / view.characterSize);
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

	var cellVisibility = [];
	if (game.ignoreFov) {
		for (var x = view.x; x < view.x + view.width; x++) {
			for (var y = view.y; y < view.y + view.height; y++) {
				if (x >= 0 && x < game.dungeons[player.level].width && y >= 0 && y < game.dungeons[player.level].height) {
					cellVisibility.push(game.dungeons[player.level].cells[x][y]);
				}
			}
		}
	}
	for (var dir = 0; dir < 360; dir += 0.5) {
		raycast(game.dungeons[player.level], player.x, player.y, player.stats.sight, dir, [
			'wall',
			'doorClosed'
		], function (x, y) {
			game.dungeons[player.level].cells[x][y].discovered = true;

			if (cellVisibility.indexOf(game.dungeons[player.level].cells[x][y]) == -1) {
				cellVisibility.push(game.dungeons[player.level].cells[x][y]);
			}
		});
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = view.characterSize + 'px mono';

	for (var x = view.x; x < view.x + view.width; x++) {
		for (var y = view.y; y < view.y + view.height; y++) {
			if (x < 0 || x >= game.dungeons[player.level].width || y < 0 || y >= game.dungeons[player.level].height) {
				continue;
			}

			ctx.fillStyle = '#fff';
			ctx.globalAlpha = 1;

			var screenX = (x - view.x) * view.characterSize;
			var screenY = (y - view.y + 1) * view.characterSize;

			if (cellVisibility.indexOf(game.dungeons[player.level].cells[x][y]) > -1) {
				var entity = false;
				for (var i = 0; i < game.dungeons[player.level].entities.length; i++) {
					if (game.dungeons[player.level].entities[i].x !== x || game.dungeons[player.level].entities[i].y !== y) {
						continue;
					}

					ctx.fillText(game.dungeons[player.level].entities[i].char, screenX, screenY);

					entity = true;

					break;
				}
				if (entity) {
					continue;
				}

				var chest = false;
				for (var i = 0; i < game.dungeons[player.level].chests.length; i++) {
					if (game.dungeons[player.level].chests[i].x !== x || game.dungeons[player.level].chests[i].y !== y) {
						continue;
					}

					ctx.fillText('~', screenX, screenY);

					chest = true;

					break;
				}
				if (chest) {
					continue;
				}

				var item = false;
				for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
					if (game.dungeons[player.level].items[i].x !== x || game.dungeons[player.level].items[i].y !== y) {
						continue;
					}

					ctx.fillText(game.dungeons[player.level].items[i].char, screenX, screenY);

					item = true;

					break;
				}
				if (item) {
					continue;
				}
			}

			if (cellVisibility.indexOf(game.dungeons[player.level].cells[x][y]) > -1 || game.dungeons[player.level].cells[x][y].discovered) {
				ctx.fillStyle = '#fff';
				if (cellVisibility.indexOf(game.dungeons[player.level].cells[x][y]) > -1) {
					ctx.globalAlpha = 1;
				} else if (game.dungeons[player.level].cells[x][y].discovered) {
					ctx.globalAlpha = 0.25;
				}

				switch (game.dungeons[player.level].cells[x][y].type) {
					case 'empty':
						ctx.fillText(' ', screenX, screenY);
						break;
					case 'floor':
						ctx.fillText('.', screenX, screenY);
						break;
					case 'grass':
						ctx.fillStyle = '#50ff50';
						ctx.fillText('^', screenX, screenY);
						break;
					case 'wall':
						ctx.fillText('#', screenX, screenY);
						break;
					case 'doorClosed':
						ctx.fillText('+', screenX, screenY);
						break;
					case 'doorOpen':
						ctx.fillText('-', screenX, screenY);
						break;
					case 'stairsUp':
						ctx.fillText('<', screenX, screenY);
						break;
					case 'stairsDown':
						ctx.fillText('>', screenX, screenY);
						break;
					case 'trap':
						ctx.fillText('^', screenX, screenY);
						break;
				}
			}
		}
	}

	ctx.fillStyle = '#fff';
	ctx.globalAlpha = 1;
	ctx.fillText(game.messages[game.messages.length - 5], 0, view.characterSize);
	ctx.fillText(game.messages[game.messages.length - 4], 0, view.characterSize * 2);
	ctx.fillText(game.messages[game.messages.length - 3], 0, view.characterSize * 3);
	ctx.fillText(game.messages[game.messages.length - 2], 0, view.characterSize * 4);
	ctx.fillText(game.messages[game.messages.length - 1], 0, view.characterSize * 5);
	ctx.fillText('Level:' + (player.level + 1) + ' ' + 'Turn:' + game.turn, 0, canvas.height);

	if (ui.mode.includes('inventory')) {
		for (var i = 0; i < player.inventory.length; i++) {
			player.inventory[i].index = String.fromCharCode(97 + i);
		}
		ctx.fillStyle = '#000';
		ctx.fillRect(canvas.width - view.characterSize * 10, 0, view.characterSize * 10, player.inventory.length * 26);
		ctx.fillStyle = '#fff';
		for (var i = 0; i < player.inventory.length; i++) {
			ctx.fillText(player.inventory[i].index + ') ' + player.inventory[i].name + player.inventory[i].equipped ? ' (equipped)' : '', canvas.width - (view.characterSize * 10), (i + 1) * view.characterSize);
		}
	}

	if (ui.mode == 'character') {
		ctx.fillStyle = '#000';
		ctx.fillRect(canvas.width - view.characterSize * 10, 0, view.characterSize * 10, view.characterSize * 10);
		ctx.fillStyle = '#fff';
		ctx.fillText('Health: ' + player.stats.health, canvas.width - (view.characterSize * 10), view.characterSize);
		ctx.fillText('Mana: ' + player.stats.mana, canvas.width - (view.characterSize * 10), view.characterSize * 2);
	}
}
