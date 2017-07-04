function input(ev: KeyboardEvent, entity: Entity) {
	const dungeon = game.dungeons[entity.level];

	switch (ui.mode) {
		case 'target':
			switch (ev.key) {
				case 't':
					ui.mode = '';

					draw(undefined, entity);

					break;
				case 'ArrowUp':
					ui.target.y--;

					draw(undefined, entity);

					break;
				case 'ArrowRight':
					ui.target.x++;

					draw(undefined, entity);

					break;
				case 'ArrowDown':
					ui.target.y++;

					draw(undefined, entity);

					break;
				case 'ArrowLeft':
					ui.target.x--;

					draw(undefined, entity);

					break;
			}

			break;
		case '':
			switch (ev.key) {
				case 't':
					ui.mode = 'target';
					ui.target.x = entity.x;
					ui.target.y = entity.y;

					draw(undefined, entity);

					break;
				case 'ArrowUp':
					moveEntity(entity, entity.x, entity.y - 1);

					tick();
					draw(undefined, entity);

					break;
				case 'ArrowRight':
					moveEntity(entity, entity.x + 1, entity.y);

					tick();
					draw(undefined, entity);

					break;
				case 'ArrowDown':
					moveEntity(entity, entity.x, entity.y + 1);

					tick();
					draw(undefined, entity);

					break;
				case 'ArrowLeft':
					moveEntity(entity, entity.x - 1, entity.y);

					tick();
					draw(undefined, entity);

					break;
				case '.':
					tick();
					draw(undefined, entity);

					break;
				case 'g':
					dungeon.items.forEach(item => {
						if (item.x !== entity.x || item.y !== entity.y) {
							return;
						}

						game.messages.push(entity.name + ' picks up a ' + item.name);

						entity.inventory.push(item);
						dungeon.items.splice(dungeon.items.indexOf(item), 1);

						draw(undefined, entity);
					});

					break;
				case 's':
					const targets: Array<Entity> = [];
					for (let dir = 0; dir < 360; dir++) {
						raycast(dungeon, entity.x, entity.y, entity.stats.sight, dir, [
							'wall',
							'doorClosed'
						], (x, y) => {
							dungeon.entities.forEach(target => {
								if (target === entity) {
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
						game.messages.push(entity.name + ' spots a ' + targets.map(target => target.name).join(', '));
					} else {
						game.messages.push(entity.name + ' doesn\'t see anything');
					}

					draw(undefined, entity);

					break;
				case 'c':
					if (dungeon.cells[entity.x][entity.y].type === 'doorOpen') {
						game.messages.push(entity.name + ' closes the door');

						dungeon.cells[entity.x][entity.y].type = 'doorClosed'

						draw(undefined, entity);
					}

					break;
				case 'i':
					if (entity.inventory.length > 0) {
						ui.mode = 'inventory';

						draw(undefined, entity);
					}

					break;
				case 'o':
					ui.mode = 'character';

					draw(undefined, entity);

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

					draw(undefined, entity);

					break;
				case 'd':
					game.messages.push('select item to drop');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_drop';

					draw(undefined, entity);

					break;
				case 'e':
					game.messages.push('select item to equip');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_equip';

					draw(undefined, entity);

					break;
				case 'u':
					game.messages.push('select item to unequip');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_unequip';

					draw(undefined, entity);

					break;
				case 's':
					game.messages.push('select first item to swap');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_swapFirst';

					draw(undefined, entity);

					break;
			}

			break;
		case 'inventory_drop':
			entity.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push(entity.name + ' drops a ' + item.name);

					item.x = entity.x;
					item.y = entity.y;

					game.dungeons[entity.level].items.push(item);
					entity.inventory.splice(entity.inventory.indexOf(item), 1);

					ui.mode = '';

					draw(undefined, entity);
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw(undefined, entity);

					break;
			}

			break;
		case 'inventory_equip':
			entity.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push(entity.name + ' equips a ' + item.name);

					item.equipped = true;

					ui.mode = '';

					draw(undefined, entity);
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw(undefined, entity);

					break;
			}

			break;
		case 'inventory_unequip':
			entity.inventory.forEach(item => {
				if (item.index === ev.key) {
					game.messages.push(entity.name + ' unequips a ' + item.name);

					item.equipped = false;

					ui.mode = '';

					draw(undefined, entity);
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw(undefined, entity);

					break;
			}

			break;
		case 'inventory_swapFirst':
			entity.inventory.forEach(item => {
				if (item.index === ev.key) {
					ui.inventorySwapFirst = entity.inventory.indexOf(item);

					game.messages.push('select second item to swap');
					game.messages.push('press space to cancel');

					ui.mode = 'inventory_swapSecond';

					draw(undefined, entity);
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw(undefined, entity);

					break;
			}

			break;
		case 'inventory_swapSecond':
			entity.inventory.forEach(item => {
				if (item.index === ev.key) {
					ui.inventorySwapSecond = entity.inventory.indexOf(item);

					game.messages.push(entity.name + ' swaps the ' + entity.inventory[ui.inventorySwapFirst].name + ' with the ' + entity.inventory[ui.inventorySwapSecond].name);

					const t = entity.inventory[ui.inventorySwapFirst];
					entity.inventory[ui.inventorySwapFirst] = entity.inventory[ui.inventorySwapSecond];
					entity.inventory[ui.inventorySwapSecond] = t;

					ui.mode = '';

					draw(undefined, entity);
				}
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					draw(undefined, entity);

					break;
			}

			break;
		case 'character':
			switch (ev.key) {
				case 'o':
					ui.mode = '';

					draw(undefined, entity);

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

			draw(undefined, entity);

			break;
		case '-':
			graphics.characterSize--;

			draw(undefined, entity);

			break;
		case '=':
			graphics.characterSize++;

			draw(undefined, entity);

			break;
		case '1':
			game.godMode = !game.godMode;

			break;
		case '2':
			game.stopTime = !game.stopTime;

			break;
		case '3':
			game.ignoreFov = !game.ignoreFov;

			draw(undefined, entity);

			break;
	}
}
