import { closeDoor, dropItem, getInventoryChar, getInventoryIndex, moveToCell, pickUpItem, resurrect } from "./actors";
import { lineOfSight } from "./algorithms";
import { config, game, init, load, log, save, ui } from "./game";
import { radiansBetween } from "./math";
import { draw } from "./renderer";
import { ActorType, CellType, Corpse, Equipment, ItemType, Potion, UIMode } from "./types";
import { findActor, tick } from "./world";

export function input(ev: KeyboardEvent) {
    const actorContext = findActor(0);
    const { actor, chunk, dungeon, level } = actorContext;

    const actorInfo = config.actorInfo[ActorType[actor.actorType]];

    const area = level || chunk;

    switch (ui.mode) {
        case UIMode.Default: {
            switch (ev.key) {
                case "ArrowUp": {
                    moveToCell(actor, { x: actor.x, y: actor.y - 1 }, chunk, dungeon, level);

                    tick();

                    break;
                }
                case "ArrowRight": {
                    moveToCell(actor, { x: actor.x + 1, y: actor.y }, chunk, dungeon, level);

                    tick();

                    break;
                }
                case "ArrowDown": {
                    moveToCell(actor, { x: actor.x, y: actor.y + 1 }, chunk, dungeon, level);

                    tick();

                    break;
                }
                case "ArrowLeft": {
                    moveToCell(actor, { x: actor.x - 1, y: actor.y }, chunk, dungeon, level);

                    tick();

                    break;
                }
                case ".": {
                    tick();

                    break;
                }
                case "g": {
                    const item = area.items.find((item) => item.x === actor.x && item.y === actor.y);

                    if (item) {
                        pickUpItem(actor, item, area);

                        tick();
                    }

                    break;
                }
                case "s": {
                    const actorNames = area.actors
                        .filter((actor) =>
                            actor !== actor
                            && lineOfSight(area, actor, radiansBetween(actor, actor), actorInfo.sight)
                                .some((coord) => coord.x === actor.x && coord.y === actor.y))
                        .map((other) => other.name)
                        .join(", ");

                    if (actorNames) {
                        log(area, actor, `${actor.name} spots ${actorNames}`);
                    } else {
                        log(area, actor, `${actor.name} doesn't see anything`);
                    }

                    break;
                }
                case "r": {
                    area.items
                        .filter((item) =>
                            item.itemType === ItemType.Corpse
                            && lineOfSight(area, actor, radiansBetween(actor, item), actorInfo.sight)
                                .some((coord) => coord.x === item.x && coord.y === item.y))
                        .map((item) => (item as Corpse))
                        .forEach((corpse) => resurrect(actor, corpse, area));

                    tick();

                    break;
                }
                case "c": {
                    const cell = area.cells[actor.x][actor.y];

                    closeDoor(actor, cell, area);

                    tick();

                    break;
                }
                case "t": {
                    ui.mode = UIMode.Target;
                    ui.target.x = actor.x;
                    ui.target.y = actor.y;

                    break;
                }
                case "i": {
                    if (actor.inventory.length > 0) {
                        ui.mode = UIMode.Inventory;
                    }

                    break;
                }
                case "o": {
                    ui.mode = UIMode.Character;

                    break;
                }
            }

            break;
        }
        case UIMode.Target: {
            switch (ev.key) {
                case "ArrowUp": {
                    ui.target.y--;

                    break;
                }
                case "ArrowRight": {
                    ui.target.x++;

                    break;
                }
                case "ArrowDown": {
                    ui.target.y++;

                    break;
                }
                case "ArrowLeft": {
                    ui.target.x--;

                    break;
                }
                case "t": {
                    ui.mode = UIMode.Default;

                    break;
                }
            }

            break;
        }
        case UIMode.Inventory: {
            switch (ev.key) {
                case "i": {
                    ui.mode = UIMode.Default;

                    break;
                }
                case "d": {
                    log(area, actor, "select item to drop");
                    log(area, actor, "press space to cancel");

                    ui.mode = UIMode.InventoryDrop;

                    break;
                }
                case "e": {
                    log(area, actor, "select item to equip");
                    log(area, actor, "press space to cancel");

                    ui.mode = UIMode.InventoryEquip;

                    break;
                }
                case "u": {
                    log(area, actor, "select item to unequip");
                    log(area, actor, "press space to cancel");

                    ui.mode = UIMode.InventoryUnequip;

                    break;
                }
                case "s": {
                    log(area, actor, "select first item to swap");
                    log(area, actor, "press space to cancel");

                    ui.mode = UIMode.InventorySwapFirst;

                    break;
                }
                case "q": {
                    log(area, actor, "select potion to drink");
                    log(area, actor, "press space to cancel");

                    ui.mode = UIMode.InventoryDrink;

                    break;
                }
            }

            break;
        }
        case UIMode.InventoryDrink: {
            const item = actor.inventory[getInventoryIndex(ev.key)];

            if (item && item.itemType === ItemType.Potion) {
                const potion = item as Potion;

                log(area, actor, `${actor.name} drinks a ${potion.name}`);

                actor.inventory.splice(actor.inventory.indexOf(potion), 1);

                ui.mode = UIMode.Default;
            }

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
        case UIMode.InventoryDrop: {
            const item = actor.inventory[getInventoryIndex(ev.key)];

            if (item) {
                dropItem(actor, item, area);

                ui.mode = UIMode.Default;
            }

            switch (ev.key) {
                case " ": {
                    ui.mode = UIMode.Default;

                    break;
                }
            }

            break;
        }
        case UIMode.InventoryEquip: {
            const item = actor.inventory[getInventoryIndex(ev.key)];

            if (item && item.itemType === ItemType.Equipment) {
                const equipment = item as Equipment;

                log(area, actor, `${actor.name} equips a ${equipment.name}`);

                equipment.equipped = true;

                ui.mode = UIMode.Default;
            }

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
        case UIMode.InventoryUnequip: {
            const item = actor.inventory[getInventoryIndex(ev.key)];

            if (item && item.itemType === ItemType.Equipment) {
                const equipment = item as Equipment;

                log(area, actor, `${actor.name} equips a ${equipment.name}`);

                equipment.equipped = false;

                ui.mode = UIMode.Default;
            }

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
        case UIMode.InventorySwapFirst: {
            const selectedItem = actor.inventory[getInventoryIndex(ev.key)];

            if (selectedItem) {
                log(area, actor, "select second item to swap");
                log(area, actor, "press space to cancel");

                ui.inventorySwapFirst = actor.inventory.indexOf(selectedItem);

                ui.mode = UIMode.InventorySwapSecond;
            }

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
        case UIMode.InventorySwapSecond: {
            const selectedItem = actor.inventory[getInventoryIndex(ev.key)];

            if (selectedItem) {
                ui.inventorySwapSecond = actor.inventory.indexOf(selectedItem);

                const i = ui.inventorySwapFirst;
                const j = ui.inventorySwapSecond;

                log(area, actor, `${actor.name} swaps the ${actor.inventory[i].name} with the ${actor.inventory[j].name}`);

                [actor.inventory[i], actor.inventory[j]] = [actor.inventory[j], actor.inventory[i]];

                ui.mode = UIMode.Default;
            }

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
        case UIMode.Character: {
            switch (ev.key) {
                case "o":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        }
    }

    switch (ev.key) {
        case "[": {
            log(area, actor, "game saved");

            save();

            break;
        }
        case "]": {
            log(area, actor, "game loaded");

            load();

            break;
        }
        case "\\": {
            init();

            break;
        }
        case "-": {
            game.fontSize--;

            break;
        }
        case "=": {
            game.fontSize++;

            break;
        }
        case "1": {
            game.godMode = !game.godMode;

            break;
        }
        case "2": {
            game.stopTime = !game.stopTime;

            break;
        }
        case "3": {
            game.ignoreFov = !game.ignoreFov;

            break;
        }
    }

    draw();
}
