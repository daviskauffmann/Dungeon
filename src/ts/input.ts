function input(ev: KeyboardEvent, entity: Entity) {
	const dungeon = getDungeon(entity);

	switch (ui.mode) {
		case 'target':
			switch (ev.key) {
				case 't':
					ui.mode = '';

					break;
				case 'ArrowUp':
					ui.target.y--;

					break;
				case 'ArrowRight':
					ui.target.x++;

					break;
				case 'ArrowDown':
					ui.target.y++;

					break;
				case 'ArrowLeft':
					ui.target.x--;

					break;
			}

			break;
		case '':
			switch (ev.key) {
				case 't':
					ui.mode = 'target';
					ui.target.x = entity.x;
					ui.target.y = entity.y;

					break;
				case 'ArrowUp':
					move(entity, entity.x, entity.y - 1);

					tick();

					break;
				case 'ArrowRight':
					move(entity, entity.x + 1, entity.y);

					tick();

					break;
				case 'ArrowDown':
					move(entity, entity.x, entity.y + 1);

					tick();

					break;
				case 'ArrowLeft':
					move(entity, entity.x - 1, entity.y);

					tick();

					break;
				case '.':
					tick();

					break;
				case 'g':
					dungeon.items.forEach((item, index) => {
						if (item.x !== entity.x || item.y !== entity.y) {
							return;
						}

						addMessage(entity.name + ' picks up a ' + item.name);

						entity.inventory.push(item);
						dungeon.items.splice(index, 1);
					});

					break;
				case 's':
					const targets: Array<Entity> = [];
					for (let dir = 0; dir < 360; dir++) {
						raycast(dungeon, { x: entity.x, y: entity.y }, entity.stats.sight, dir, [
							CellType.Wall,
							CellType.DoorClosed
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
						addMessage(entity.name + ' spots a ' + targets.map(target => target.name).join(', '));
					} else {
						addMessage(entity.name + ' doesn\'t see anything');
					}

					break;
				case 'r':
					for (let dir = 0; dir < 360; dir++) {
						raycast(dungeon, { x: entity.x, y: entity.y }, entity.stats.sight, dir, [
							CellType.Wall,
							CellType.DoorClosed
						], (x, y) => {
							dungeon.items.forEach((item, index) => {
								if (item.x !== x || item.y !== y) {
									return;
								}

								if (!('originalChar' in item)) {
									return;
								}

								const corpse = (<Corpse>item);
								corpse.name = corpse.name.replace(' corpse', '');

								addMessage(entity.name + ' ressurects ' + corpse.name);

								dungeon.entities.push({
									x: corpse.x,
									y: corpse.y,
									char: corpse.originalChar,
									color: corpse.color,
									alpha: corpse.alpha,
									id: corpse.id,
									name: corpse.name,
									level: entity.level,
									class: corpse.class,
									stats: corpse.stats,
									inventory: corpse.inventory,
									factions: corpse.factions,
									hostileFactions: corpse.hostileFactions,
									hostileEntityIds: corpse.hostileEntityIds,
									disposition: corpse.disposition
								});
								dungeon.items.splice(index, 1);
							});
						});
					}

					break;
				case 'c':
					if (dungeon.cells[entity.x][entity.y].type === CellType.DoorOpen) {
						addMessage(entity.name + ' closes the door');

						dungeon.cells[entity.x][entity.y].type = CellType.DoorClosed
					}

					break;
				case 'i':
					if (entity.inventory.length > 0) {
						ui.mode = 'inventory';
					}

					break;
				case 'o':
					ui.mode = 'character';

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

					break;
				case 'd':
					addMessage('select item to drop');
					addMessage('press space to cancel');

					ui.mode = 'inventory_drop';

					break;
				case 'e':
					addMessage('select item to equip');
					addMessage('press space to cancel');

					ui.mode = 'inventory_equip';

					break;
				case 'u':
					addMessage('select item to unequip');
					addMessage('press space to cancel');

					ui.mode = 'inventory_unequip';

					break;
				case 's':
					addMessage('select first item to swap');
					addMessage('press space to cancel');

					ui.mode = 'inventory_swapFirst';

					break;
			}

			break;
		case 'inventory_drop':
			entity.inventory.forEach(item => {
				if (getInventoryIndex(entity, item) !== ev.key) {
					return;
				}

				addMessage(entity.name + ' drops a ' + item.name);

				item.x = entity.x;
				item.y = entity.y;

				game.dungeons[entity.level].items.push(item);
				entity.inventory.splice(entity.inventory.indexOf(item), 1);

				ui.mode = '';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'inventory_equip':
			entity.inventory.forEach(item => {
				if (getInventoryIndex(entity, item) !== ev.key) {
					return;
				}

				addMessage(entity.name + ' equips a ' + item.name);

				item.equipped = true;

				ui.mode = '';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'inventory_unequip':
			entity.inventory.forEach(item => {
				if (getInventoryIndex(entity, item) !== ev.key) {
					return;
				}

				addMessage(entity.name + ' unequips a ' + item.name);

				item.equipped = false;

				ui.mode = '';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'inventory_swapFirst':
			entity.inventory.forEach(item => {
				if (getInventoryIndex(entity, item) !== ev.key) {
					return;
				}

				ui.inventorySwapFirst = entity.inventory.indexOf(item);

				addMessage('select second item to swap');
				addMessage('press space to cancel');

				ui.mode = 'inventory_swapSecond';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'inventory_swapSecond':
			entity.inventory.forEach(item => {
				if (getInventoryIndex(entity, item) !== ev.key) {
					return;
				}

				ui.inventorySwapSecond = entity.inventory.indexOf(item);

				addMessage(entity.name + ' swaps the ' + entity.inventory[ui.inventorySwapFirst].name + ' with the ' + entity.inventory[ui.inventorySwapSecond].name);

				const t = entity.inventory[ui.inventorySwapFirst];
				entity.inventory[ui.inventorySwapFirst] = entity.inventory[ui.inventorySwapSecond];
				entity.inventory[ui.inventorySwapSecond] = t;

				ui.mode = '';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'character':
			switch (ev.key) {
				case 'o':
					ui.mode = '';

					break;
			}

			break;
	}

	switch (ev.key) {
		case '[':
			addMessage('game saved');

			localStorage.setItem('game', JSON.stringify(game));
			console.log(JSON.stringify(game));

			break;
		case ']':
			addMessage('game loaded');

			game = JSON.parse(localStorage.getItem('game'));
			console.log(game);

			break;
		case '\\':
			console.log(game);

			break;
		case '-':
			graphics.fontSize--;

			break;
		case '=':
			graphics.fontSize++;

			break;
		case '1':
			game.godMode = !game.godMode;

			break;
		case '2':
			game.stopTime = !game.stopTime;

			break;
		case '3':
			game.ignoreFov = !game.ignoreFov;

			break;
	}

	draw(undefined, entity);
}
