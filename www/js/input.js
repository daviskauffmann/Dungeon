// needs a major overhaul
document.addEventListener('keydown', ev => {
	var player = getPlayer();
	switch (ui.mode) {
		case 'target':
			if (ev.key === 't') {
				ui.mode = '';
			}
			if (ev.key === 'ArrowUp') {
				draw();
			}
			if (ev.key === 'ArrowRight') {
				draw();
			}
			if (ev.key === 'ArrowDown') {
				draw();
			}
			if (ev.key === 'ArrowLeft') {
				draw();
			}
			break;
		case '':
			if (ev.key === 't') {
				ui.mode = 'target';
				ui.target.x = player.x;
				ui.target.y = player.y;
			}
			if (ev.key === 'ArrowUp') {
				moveEntity(player, player.x, player.y - 1);
				tick();
				draw();
			}
			if (ev.key === 'ArrowRight') {
				moveEntity(player, player.x + 1, player.y);
				tick();
				draw();
			}
			if (ev.key === 'ArrowDown') {
				moveEntity(player, player.x, player.y + 1);
				tick();
				draw();
			}
			if (ev.key === 'ArrowLeft') {
				moveEntity(player, player.x - 1, player.y);
				tick();
				draw();
			}
			if (ev.key === '.') {
				tick();
				draw();
			}
			if (ev.key === 'g') {
				for (var i = 0; i < game.dungeons[player.level].items.length; i++) {
					if (player.x === game.dungeons[player.level].items[i].x && player.y === game.dungeons[player.level].items[i].y) {
						game.messages.push('you pick up a ' + game.dungeons[player.level].items[i].name);
						player.inventory.push(game.dungeons[player.level].items[i]);
						game.dungeons[player.level].items.splice(i, 1);
						draw();
						break;
					}
				}
			}
			if (ev.key === 's') {
				var targets = [];
				for (var dir = 0; dir < 360; dir++) {
					raycast(game.dungeons[player.level], player.x, player.y, player.stats.sight, dir, function (x, y) {
						for (var i = 0; i < game.dungeons[player.level].entities.length; i++) {
							if (game.dungeons[player.level].entities[i] === player) {
								continue;
							}
							if (targets.indexOf(game.dungeons[player.level].entities[i]) > -1) {
								continue;
							}
							if (game.dungeons[player.level].entities[i].x === x && game.dungeons[player.level].entities[i].y === y) {
								targets.push(game.dungeons[player.level].entities[i]);
							}
						}
					});
				}
				if (targets.length > 0) {
					var targetNames = [];
					for (var i = 0; i < targets.length; i++) {
						targetNames.push(targets[i].name);
					}
					game.messages.push('you spot a ' + targetNames.join(', '));
				} else {
					game.messages.push('you don\'t see anything');
				}
				draw();
			}
			if (ev.key === 'c') {
				if (game.dungeons[player.level].cells[player.x][player.y].type === 'doorOpen') {
					game.messages.push('you close the door');
					game.dungeons[player.level].cells[player.x][player.y].type = 'doorClosed'
					draw();
				}
			}
			if (ev.key === 'i') {
				if (player.inventory.length > 0) {
					ui.mode = 'inventory';
					draw();
				}
			}
			if (ev.key === 'o') {
				ui.mode = 'character';
				draw();
			}
			/*if (e.key === 'i') {
            	ui.mode = 'spellbook';
            	draw();
            }*/
			break;
		case 'inventory':
			if (ev.key === 'i') {
				ui.mode = '';
				draw();
			}
			if (ev.key === 'd') {
				game.messages.push('select item to drop');
				game.messages.push('press space to cancel');
				ui.mode = 'inventory_drop';
				draw();
			}
			if (ev.key === 'e') {
				game.messages.push('select item to equip');
				game.messages.push('press space to cancel');
				ui.mode = 'inventory_equip';
				draw();
			}
			if (ev.key === 'u') {
				game.messages.push('select item to unequip');
				game.messages.push('press space to cancel');
				ui.mode = 'inventory_unequip';
				draw();
			}
			if (ev.key === 's') {
				game.messages.push('select first item to swap');
				game.messages.push('press space to cancel');
				ui.mode = 'inventory_swapFirst';
				draw();
			}
			break;
		case 'inventory_drop':
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index === ev.key) {
					game.messages.push('you drop a ' + player.inventory[i].name);
					player.inventory[i].x = player.x;
					player.inventory[i].y = player.y;
					game.dungeons[player.level].items.push(player.inventory[i]);
					player.inventory.splice(i, 1);
					ui.mode = '';
					draw();
				}
			}
			if (ev.key === ' ') {
				ui.mode = '';
				draw();
			}
			break;
		case 'inventory_equip':
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index === ev.key) {
					game.messages.push('you equip a ' + player.inventory[i].name);
					player.inventory[i].equipped = true;
					ui.mode = '';
					draw();
				}
			}
			if (ev.key === ' ') {
				ui.mode = '';
				draw();
			}
			break;
		case 'inventory_unequip':
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index === ev.key) {
					game.messages.push('you unequip a ' + player.inventory[i].name);
					player.inventory[i].equipped = false;
					ui.mode = '';
					draw();
				}
			}
			if (ev.key === ' ') {
				ui.mode = '';
				draw();
			}
			break;
		case 'inventory_swapFirst':
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index === ev.key) {
					ui.inventorySwapFirst = i;
					game.messages.push('select second item to swap');
					game.messages.push('press space to cancel');
					ui.mode = 'inventory_swapSecond';
					draw();
				}
			}
			if (ev.key === ' ') {
				ui.mode = '';
				draw();
			}
			break;
		case 'inventory_swapSecond':
			for (var i = 0; i < player.inventory.length; i++) {
				if (player.inventory[i].index === ev.key) {
					ui.inventorySwapSecond = i;
					game.messages.push('you swap the ' + player.inventory[ui.inventorySwapFirst].name + ' with the ' + player.inventory[ui.inventorySwapSecond].name);
					var t = player.inventory[ui.inventorySwapFirst];
					player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
					player.inventory[ui.inventorySwapSecond] = t;
					ui.mode = '';
					draw();
				}
			}
			if (ev.key === ' ') {
				ui.mode = '';
				draw();
			}
			break;
		case 'character':
			if (ev.key === 'o') {
				ui.mode = '';
				draw();
			}
			break;
	}
	/*if (e.key === '1') {
		localStorage.setItem('game', JSON.stringify(game));
		console.log(JSON.stringify(game));
		game.messages.push('game saved');
	}
	if (e.key === '2') {
		game = JSON.parse(localStorage.getItem('game'));
		console.log(game);
		game.messages.push('game loaded');
		draw();
	}*/
	if (ev.key === '1') {
		game.stopTime = !game.stopTime;
	}
	if (ev.key === '2') {
		game.ignoreFov = !game.ignoreFov;
		draw();
	}
});
