import { raycast } from './algorithms';
import { CellType, Corpse } from './dungeon';
import { Entity, getDungeon, getEntity, getInventoryChar, move } from './entity';
import { game, load, save, tick } from './game';
import { draw, graphics } from './renderer';
import { log, ui } from './ui';

export function input(ev: KeyboardEvent) {
    const player = getEntity(0);
    const dungeon = getDungeon(player);

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
                    ui.target.x = player.x;
                    ui.target.y = player.y;

                    break;
                case 'ArrowUp':
                    move(player, player.x, player.y - 1);

                    tick();

                    break;
                case 'ArrowRight':
                    move(player, player.x + 1, player.y);

                    tick();

                    break;
                case 'ArrowDown':
                    move(player, player.x, player.y + 1);

                    tick();

                    break;
                case 'ArrowLeft':
                    move(player, player.x - 1, player.y);

                    tick();

                    break;
                case '.':
                    tick();

                    break;
                case 'g':
                    dungeon.items.forEach((item, index) => {
                        if (item.x !== player.x || item.y !== player.y) {
                            return;
                        }

                        log(dungeon, { x: player.x, y: player.y }, `${player.name} picks up a ${item.name}`);

                        player.inventory.push(item);
                        dungeon.items.splice(index, 1);
                    });

                    tick();

                    break;
                case 's':
                    const targets: Array<Entity> = [];
                    for (let dir = 0; dir < 360; dir++) {
                        raycast(dungeon, { x: player.x, y: player.y }, player.sight, dir, [
                            CellType.Wall,
                            CellType.DoorClosed
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
                        log(dungeon, { x: player.x, y: player.y }, `${player.name} spots a ${targets.map(target => target.name).join(', ')}`);
                    } else {
                        log(dungeon, { x: player.x, y: player.y }, `${player.name} doesn't see anything`);
                    }

                    tick();

                    break;
                case 'r':
                    for (let dir = 0; dir < 360; dir++) {
                        raycast(dungeon, { x: player.x, y: player.y }, player.sight, dir, [
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
                                    sight: corpse.sight,
                                    inventory: corpse.inventory,
                                    factions: corpse.factions,
                                    hostileFactions: corpse.hostileFactions,
                                    hostileEntityIds: corpse.hostileEntityIds,
                                    disposition: corpse.disposition
                                };

                                log(dungeon, { x: player.x, y: player.y }, `${player.name} ressurects ${newEntity.name}`);

                                dungeon.entities.push(newEntity);
                                dungeon.items.splice(index, 1);
                            });
                        });
                    }

                    tick();

                    break;
                case 'c':
                    if (dungeon.cells[player.x][player.y].type === CellType.DoorOpen) {
                        log(dungeon, { x: player.x, y: player.y }, `${player.name} closes the door`);

                        dungeon.cells[player.x][player.y].type = CellType.DoorClosed
                    }

                    tick();

                    break;
                case 'i':
                    if (player.inventory.length > 0) {
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
                    log(dungeon, { x: player.x, y: player.y }, 'select item to drop');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = 'inventory_drop';

                    break;
                case 'e':
                    log(dungeon, { x: player.x, y: player.y }, 'select item to equip');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = 'inventory_equip';

                    break;
                case 'u':
                    log(dungeon, { x: player.x, y: player.y }, 'select item to unequip');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = 'inventory_unequip';

                    break;
                case 's':
                    log(dungeon, { x: player.x, y: player.y }, 'select first item to swap');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = 'inventory_swapFirst';

                    break;
            }

            break;
        case 'inventory_drop':
            player.inventory.forEach((item, index) => {
                if (getInventoryChar(player, item) !== ev.key) {
                    return;
                }

                log(dungeon, { x: player.x, y: player.y }, `${player.name} drops a ${item.name}`);

                item.x = player.x;
                item.y = player.y;

                dungeon.items.push(item);
                player.inventory.splice(index, 1);

                ui.mode = '';
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = '';

                    break;
            }

            break;
        case 'inventory_equip':
            player.inventory.forEach(item => {
                if (getInventoryChar(player, item) !== ev.key) {
                    return;
                }

                log(dungeon, { x: player.x, y: player.y }, `${player.name} equips a ${item.name}`);

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
            player.inventory.forEach(item => {
                if (getInventoryChar(player, item) !== ev.key) {
                    return;
                }

                log(dungeon, { x: player.x, y: player.y }, `${player.name} unequips a ${item.name}`);

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
            player.inventory.forEach((item, index) => {
                if (getInventoryChar(player, item) !== ev.key) {
                    return;
                }

                ui.inventorySwapFirst = index;

                log(dungeon, { x: player.x, y: player.y }, 'select second item to swap');
                log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                ui.mode = 'inventory_swapSecond';
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = '';

                    break;
            }

            break;
        case 'inventory_swapSecond':
            player.inventory.forEach((item, index) => {
                if (getInventoryChar(player, item) !== ev.key) {
                    return;
                }

                ui.inventorySwapSecond = index;

                log(dungeon, { x: player.x, y: player.y }, `${player.name} swaps the ${player.inventory[ui.inventorySwapFirst].name} with the ${player.inventory[ui.inventorySwapSecond].name}`);

                const t = player.inventory[ui.inventorySwapFirst];
                player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
                player.inventory[ui.inventorySwapSecond] = t;

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
            log(dungeon, { x: player.x, y: player.y }, 'game saved');

            save();

            break;
        case ']':
            log(dungeon, { x: player.x, y: player.y }, 'game loaded');

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

    draw(undefined);
}
