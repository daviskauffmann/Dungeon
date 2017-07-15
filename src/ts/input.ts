import { lineOfSight } from './algorithms';
import { getDungeon, getEntity, getInventoryChar, move } from './entity';
import { game, load, log, save, tick, ui } from './game';
import { radiansBetween } from './math';
import { draw } from './renderer';
import { CellType, Corpse, Entity, UIMode } from './types';

export function input(ev: KeyboardEvent) {
    const player = getEntity(0);
    const dungeon = getDungeon(player);

    switch (ui.mode) {
        case UIMode.Default:
            switch (ev.key) {
                case 'ArrowUp':
                    move(dungeon, player, { x: player.x, y: player.y - 1 });

                    tick();

                    break;
                case 'ArrowRight':
                    move(dungeon, player, { x: player.x + 1, y: player.y });

                    tick();

                    break;
                case 'ArrowDown':
                    move(dungeon, player, { x: player.x, y: player.y + 1 });

                    tick();

                    break;
                case 'ArrowLeft':
                    move(dungeon, player, { x: player.x - 1, y: player.y });

                    tick();

                    break;
                case '.':
                    tick();

                    break;
                case 'g':
                    dungeon.items.forEach((item, index) => {
                        if (item.x === player.x && item.y === player.y) {
                            log(dungeon, { x: player.x, y: player.y }, `${player.name} picks up a ${item.name}`);

                            player.inventory.push(item);
                            dungeon.items.splice(index, 1);
                        }
                    });

                    tick();

                    break;
                case 's':
                    const targets = dungeon.entities.filter((target) => target !== player
                        && target.factions.some((faction) => player.hostileFactions.indexOf(faction) > -1)
                        && lineOfSight(dungeon, { x: player.x, y: player.y }, player.sight, radiansBetween({ x: player.x, y: player.y }, { x: target.x, y: target.y }))
                            .some((coord) => coord.x === target.x && coord.y === target.y));

                    if (targets.length) {
                        log(dungeon, { x: player.x, y: player.y },
                            `${player.name} spots ${targets.map((target) => target.name).join(', ')}`);
                    } else {
                        log(dungeon, { x: player.x, y: player.y }, `${player.name} doesn't see anything`);
                    }

                    break;
                case 'r':
                    dungeon.items.filter((item) => 'originalChar' in item
                        && lineOfSight(dungeon, { x: player.x, y: player.y }, player.sight, radiansBetween({ x: player.x, y: player.y }, { x: item.x, y: item.y }))
                            .some((coord) => coord.x === item.x && coord.y === item.y))
                        .map((item) => (item as Corpse))
                        .forEach((corpse) => {
                            const newEntity: Entity = {
                                alpha: corpse.alpha,
                                char: corpse.originalChar,
                                class: corpse.class,
                                color: corpse.color,
                                disposition: corpse.disposition,
                                factions: corpse.factions,
                                hostileEntityIds: corpse.hostileEntityIds,
                                hostileFactions: corpse.hostileFactions,
                                id: corpse.id,
                                inventory: corpse.inventory,
                                level: corpse.level,
                                name: corpse.name.replace(' corpse', ''),
                                sight: corpse.sight,
                                x: corpse.x,
                                y: corpse.y,
                            };

                            log(dungeon, { x: player.x, y: player.y }, `${player.name} ressurects ${newEntity.name}`);

                            dungeon.items.splice(dungeon.items.indexOf(corpse), 1);
                            dungeon.entities.push(newEntity);
                        });

                    tick();

                    break;
                case 'c':
                    if (dungeon.cells[player.x][player.y].type === CellType.DoorOpen) {
                        log(dungeon, { x: player.x, y: player.y }, `${player.name} closes the door`);

                        dungeon.cells[player.x][player.y].type = CellType.DoorClosed;
                    }

                    tick();

                    break;
                case 't':
                    ui.mode = UIMode.Target;
                    ui.target.x = player.x;
                    ui.target.y = player.y;

                    break;
                case 'i':
                    if (player.inventory.length > 0) {
                        ui.mode = UIMode.Inventory;
                    }

                    break;
                case 'o':
                    ui.mode = UIMode.Character;

                    break;
            }

            break;
        case UIMode.Target:
            switch (ev.key) {
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
                case 't':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.Inventory:
            switch (ev.key) {
                case 'i':
                    ui.mode = UIMode.Default;

                    break;
                case 'd':
                    log(dungeon, { x: player.x, y: player.y }, 'select item to drop');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = UIMode.InventoryDrop;

                    break;
                case 'e':
                    log(dungeon, { x: player.x, y: player.y }, 'select item to equip');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = UIMode.InventoryEquip;

                    break;
                case 'u':
                    log(dungeon, { x: player.x, y: player.y }, 'select item to unequip');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = UIMode.InventoryUnequip;

                    break;
                case 's':
                    log(dungeon, { x: player.x, y: player.y }, 'select first item to swap');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = UIMode.InventorySwapFirst;

                    break;
            }

            break;
        case UIMode.InventoryDrop:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(dungeon, { x: player.x, y: player.y }, `${player.name} drops a ${item.name}`);

                    item.x = player.x;
                    item.y = player.y;

                    player.inventory.splice(index, 1);
                    dungeon.items.push(item);

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventoryEquip:
            player.inventory.forEach((item) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(dungeon, { x: player.x, y: player.y }, `${player.name} equips a ${item.name}`);

                    item.equipped = true;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventoryUnequip:
            player.inventory.forEach((item) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(dungeon, { x: player.x, y: player.y }, `${player.name} unequips a ${item.name}`);

                    item.equipped = false;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventorySwapFirst:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    ui.inventorySwapFirst = index;

                    log(dungeon, { x: player.x, y: player.y }, 'select second item to swap');
                    log(dungeon, { x: player.x, y: player.y }, 'press space to cancel');

                    ui.mode = UIMode.InventorySwapSecond;
                }
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventorySwapSecond:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    ui.inventorySwapSecond = index;

                    log(dungeon, { x: player.x, y: player.y }, `${player.name} swaps the ${player.inventory[ui.inventorySwapFirst].name} with the ${player.inventory[ui.inventorySwapSecond].name}`);

                    const t = player.inventory[ui.inventorySwapFirst];
                    player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
                    player.inventory[ui.inventorySwapSecond] = t;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case ' ':
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.Character:
            switch (ev.key) {
                case 'o':
                    ui.mode = UIMode.Default;

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
            game.fontSize--;

            break;
        case '=':
            game.fontSize++;

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

    draw();
}
