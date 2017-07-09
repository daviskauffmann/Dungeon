﻿import { raycast } from './algorithms';
import { CellType, Corpse } from './dungeon';
import { Entity, getDungeon, getInventoryChar, move } from './entity';
import { game, load, save, tick } from './game';
import { draw, graphics } from './renderer';
import { log, ui } from './ui';

export function input(ev: KeyboardEvent, entity: Entity) {
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

						log(`${entity.name} picks up a ${item.name}`);

						entity.inventory.push(item);
						dungeon.items.splice(index, 1);
					});

					tick();

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
						log(`${entity.name} spots a ${targets.map(target => target.name).join(', ')}`);
					} else {
						log(`${entity.name} doesn't see anything`);
					}

					tick();

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

								const corpse = <Corpse>item;

								const newEntity: Entity = {
									x: corpse.x,
									y: corpse.y,
									char: corpse.originalChar,
									color: corpse.color,
									alpha: corpse.alpha,
									id: corpse.id,
									name: corpse.name.replace(' corpse', ''),
									level: corpse.level,
									class: corpse.class,
									stats: corpse.stats,
									inventory: corpse.inventory,
									factions: corpse.factions,
									hostileFactions: corpse.hostileFactions,
									hostileEntityIds: corpse.hostileEntityIds,
									disposition: corpse.disposition
								};

								log(`${entity.name} ressurects ${newEntity.name}`);

								dungeon.entities.push(newEntity);
								dungeon.items.splice(index, 1);
							});
						});
					}

					tick();

					break;
				case 'c':
					if (dungeon.cells[entity.x][entity.y].type === CellType.DoorOpen) {
						log(`${entity.name} closes the door`);

						dungeon.cells[entity.x][entity.y].type = CellType.DoorClosed
					}

					tick();

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
					log('select item to drop');
					log('press space to cancel');

					ui.mode = 'inventory_drop';

					break;
				case 'e':
					log('select item to equip');
					log('press space to cancel');

					ui.mode = 'inventory_equip';

					break;
				case 'u':
					log('select item to unequip');
					log('press space to cancel');

					ui.mode = 'inventory_unequip';

					break;
				case 's':
					log('select first item to swap');
					log('press space to cancel');

					ui.mode = 'inventory_swapFirst';

					break;
			}

			break;
		case 'inventory_drop':
			entity.inventory.forEach((item, index) => {
				if (getInventoryChar(entity, item) !== ev.key) {
					return;
				}

				log(`${entity.name} drops a ${item.name}`);

				item.x = entity.x;
				item.y = entity.y;

				dungeon.items.push(item);
				entity.inventory.splice(index, 1);

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
				if (getInventoryChar(entity, item) !== ev.key) {
					return;
				}

				log(`${entity.name} equips a ${item.name}`);

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
				if (getInventoryChar(entity, item) !== ev.key) {
					return;
				}

				log(`${entity.name} unequips a ${item.name}`);

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
			entity.inventory.forEach((item, index) => {
				if (getInventoryChar(entity, item) !== ev.key) {
					return;
				}

				ui.inventorySwapFirst = index;

				log('select second item to swap');
				log('press space to cancel');

				ui.mode = 'inventory_swapSecond';
			});

			switch (ev.key) {
				case ' ':
					ui.mode = '';

					break;
			}

			break;
		case 'inventory_swapSecond':
			entity.inventory.forEach((item, index) => {
				if (getInventoryChar(entity, item) !== ev.key) {
					return;
				}

				ui.inventorySwapSecond = index;

				log(`${entity.name} swaps the ${entity.inventory[ui.inventorySwapFirst].name} with the ${entity.inventory[ui.inventorySwapSecond].name}`);

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
			log('game saved');

			save();

			break;
		case ']':
			log('game loaded');

			load();

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
