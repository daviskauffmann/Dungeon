function input(ev: KeyboardEvent) {
	const player = getPlayer();
	const dungeon = game.dungeons[player.level];

	switch (ui.mode) {
		case 'target':
			switch (ev.key) {
				case 't':
					ui.mode = '';

					draw();

					break;
				case 'ArrowUp':
					ui.target.y--;

					draw();

					break;
				case 'ArrowRight':
					ui.target.x++;

					draw();

					break;
				case 'ArrowDown':
					ui.target.y++;

					draw();

					break;
				case 'ArrowLeft':
					ui.target.x--;

					draw();

					break;
			}

			break;
		case '':
			switch (ev.key) {
				case 't':
					ui.mode = 'target';
					ui.target.x = player.x;
					ui.target.y = player.y;

					draw();

					break;
				case 'ArrowUp':
					moveEntity(player, player.x, player.y - 1);

					tick();
					draw();

					break;
				case 'ArrowRight':
					moveEntity(player, player.x + 1, player.y);

					tick();
					draw();

					break;
				case 'ArrowDown':
					moveEntity(player, player.x, player.y + 1);

					tick();
					draw();

					break;
				case 'ArrowLeft':
					moveEntity(player, player.x - 1, player.y);

					tick();
					draw();

					break;
				case '.':
					tick();
					draw();

					break;
				case 'g':
					dungeon.items.forEach(item => {
						if (item.x !== player.x || item.y !== player.y) {
							return;
						}

						game.messages.push('you pick up a ' + item.name);

						player.inventory.push(item);
						dungeon.items.splice(dungeon.items.indexOf(item), 1);

						draw();
					});

					break;
				case 's':
					const targets: Array<Entity> = [];
					for (let dir = 0; dir < 360; dir++) {
						raycast(dungeon, player.x, player.y, player.stats.sight, dir, [
							'wall',
							'doorClosed'
						], (x, y) => {
							dungeon.entities.forEach(target => {
								if (target === player) {
									return;
								}

								if (targets.indexOf(target) > -1) {
									return;
								}

								if (target.x !== x || target.y !== y) {
									return;
								}

								targets.push(target);
							});
						});
					}
					if (targets.length > 0) {
						game.messages.push('you spot a ' + targets.map(target => target.name).join(', '));
					} else {
						game.messages.push('you don\'t see anything');
					}

					draw();

					break;
				case 'c':
					if (dungeon.cells[player.x][player.y].type === 'doorOpen') {
						game.messages.push('you close the door');

						dungeon.cells[player.x][player.y].type = 'doorClosed'

						draw();
					}

					break;
				case 'i':
					if (player.inventory.length > 0) {
						ui.mode = 'inventory';

						draw();
					}

					break;
				case 'o':
					ui.mode = 'character';

					draw();

					break;
				/*case 'i':
					ui.mode = 'spellbook';

					break;*/
			}

			break;
		case 'inventory':
			switch (ev.key) {
				case 'i':
					ui.mode = '';

					draw();

					break;
				case 'd':
					game.messages.push('select item to drop');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_drop';

					draw();

					break;
				case 'e':
					game.messages.push('select item to equip');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_equip';

					draw();

					break;
				case 'u':
					game.messages.push('select item to unequip');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_unequip';

					draw();

					break;
				case 's':
					game.messages.push('select first item to swap');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_swapFirst';

					draw();

					break;
			}

			break;
		case 'inventory_drop':
			player.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push('you drop a ' + item.name);

					item.x = player.x;
					item.y = player.y;

					game.dungeons[player.level].items.push(item);
					player.inventory.splice(player.inventory.indexOf(item), 1);

					ui.mode = '';

					draw();
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw();

					break;
			}

			break;
		case 'inventory_equip':
			player.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push('you equip a ' + item.name);

					item.equipped = true;

					ui.mode = '';

					draw();
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw();

					break;
			}

			break;
		case 'inventory_unequip':
			player.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push('you unequip a ' + item.name);

					item.equipped = false;

					ui.mode = '';

					draw();
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw();

					break;
			}

			break;
		case 'inventory_swapFirst':
			player.inventory.forEach(item => {
				if (item.index === ev.key) {
					ui.inventorySwapFirst = player.inventory.indexOf(item);

					game.messages.push('select second item to swap');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_swapSecond';

					draw();
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw();

					break;
			}

			break;
		case 'inventory_swapSecond':
			player.inventory.forEach(item => {
				if (item.index === ev.key) {
					ui.inventorySwapSecond = player.inventory.indexOf(item);

					game.messages.push('you swap the ' + player.inventory[ui.inventorySwapFirst].name + ' with the ' + player.inventory[ui.inventorySwapSecond].name);

					const t = player.inventory[ui.inventorySwapFirst];
					player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
					player.inventory[ui.inventorySwapSecond] = t;

					ui.mode = '';

					draw();
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw();

					break;
			}

			break;
		case 'character':
			switch (ev.key) {
				case 'o':
					ui.mode = '';

					draw();

					break;
			}

			break;
	}

	switch (ev.key) {
		case '[':
			game.messages.push('game saved');

			localStorage.setItem('game', JSON.stringify(game));
			console.log(JSON.stringify(game));

			break;
		case ']':
			game.messages.push('game loaded');

			game = JSON.parse(localStorage.getItem('game'));
			console.log(game);

			draw();

			break;
		case '-':
			view.characterSize--;

			draw();

			break;
		case '=':
			view.characterSize++;

			draw();

			break;
		case '1':
			game.godMode = !game.godMode;

			break;
		case '2':
			game.stopTime = !game.stopTime;

			break;
		case '3':
			game.ignoreFov = !game.ignoreFov;

			draw();

			break;
	}
}
