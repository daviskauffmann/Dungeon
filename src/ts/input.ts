import { getInventoryChar, move } from "./actors";
import { lineOfSight } from "./algorithms";
import { config, game, load, log, save, tick, ui } from "./game";
import { radiansBetween } from "./math";
import { draw } from "./renderer";
import { Actor, CellType, Corpse, UIMode } from "./types";
import { findActor } from "./utils";

export function input(ev: KeyboardEvent) {
    const playerContext = findActor(0);
    const player = playerContext.actor;
    const playerInfo = config.actorInfo[player.actorType];
    const chunk = playerContext.chunk;
    const dungeon = playerContext.dungeon;
    const level = playerContext.level;
    const area = level || chunk;

    switch (ui.mode) {
        case UIMode.Default:
            switch (ev.key) {
                case "ArrowUp":
                    move(player, playerContext, { x: player.x, y: player.y - 1 });

                    tick();

                    break;
                case "ArrowRight":
                    move(player, playerContext, { x: player.x + 1, y: player.y });

                    tick();

                    break;
                case "ArrowDown":
                    move(player, playerContext, { x: player.x, y: player.y + 1 });

                    tick();

                    break;
                case "ArrowLeft":
                    move(player, playerContext, { x: player.x - 1, y: player.y });

                    tick();

                    break;
                case ".":
                    tick();

                    break;
                case "g":
                    area.items.forEach((item, index) => {
                        if (item.x === player.x && item.y === player.y) {
                            log(area, { x: player.x, y: player.y }, `${player.name} picks up a ${item.name}`);

                            player.inventory.push(item);
                            area.items.splice(index, 1);
                        }
                    });

                    tick();

                    break;
                case "s":
                    const targets = area.actors.filter((target) => target !== player
                        && config.actorInfo[target.actorType].factions.some((faction) => playerInfo.hostileFactions.indexOf(faction) > -1)
                        && lineOfSight(area, { x: player.x, y: player.y }, radiansBetween({ x: player.x, y: player.y }, { x: target.x, y: target.y }), playerInfo.sight)
                            .some((coord) => coord.x === target.x && coord.y === target.y));

                    if (targets.length) {
                        log(area, { x: player.x, y: player.y },
                            `${player.name} spots ${targets.map((target) => target.name).join(", ")}`);
                    } else {
                        log(area, { x: player.x, y: player.y }, `${player.name} doesn"t see anything`);
                    }

                    break;
                case "r":
                    area.items.filter((item) => "originalChar" in item
                        && lineOfSight(area, { x: player.x, y: player.y }, radiansBetween({ x: player.x, y: player.y }, { x: item.x, y: item.y }), playerInfo.sight)
                            .some((coord) => coord.x === item.x && coord.y === item.y))
                        .map((item) => (item as Corpse))
                        .forEach((corpse) => {
                            const newActor: Actor = {
                                actorType: corpse.actorType,
                                class: corpse.class,
                                experience: corpse.experience,
                                hostileActorIds: corpse.hostileActorIds,
                                id: corpse.id,
                                inventory: corpse.inventory,
                                level: corpse.level,
                                name: corpse.name.replace(" corpse", ""),
                                x: corpse.x,
                                y: corpse.y,
                            };

                            log(area, { x: player.x, y: player.y }, `${player.name} ressurects ${newActor.name}`);

                            area.items.splice(area.items.indexOf(corpse), 1);
                            area.actors.push(newActor);
                        });

                    tick();

                    break;
                case "c":
                    if (area.cells[player.x][player.y].type === CellType.DoorOpen) {
                        log(area, { x: player.x, y: player.y }, `${player.name} closes the door`);

                        area.cells[player.x][player.y].type = CellType.DoorClosed;
                    }

                    tick();

                    break;
                case "t":
                    ui.mode = UIMode.Target;
                    ui.target.x = player.x;
                    ui.target.y = player.y;

                    break;
                case "i":
                    if (player.inventory.length > 0) {
                        ui.mode = UIMode.Inventory;
                    }

                    break;
                case "o":
                    ui.mode = UIMode.Character;

                    break;
            }

            break;
        case UIMode.Target:
            switch (ev.key) {
                case "ArrowUp":
                    ui.target.y--;

                    break;
                case "ArrowRight":
                    ui.target.x++;

                    break;
                case "ArrowDown":
                    ui.target.y++;

                    break;
                case "ArrowLeft":
                    ui.target.x--;

                    break;
                case "t":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.Inventory:
            switch (ev.key) {
                case "i":
                    ui.mode = UIMode.Default;

                    break;
                case "d":
                    log(area, { x: player.x, y: player.y }, "select item to drop");
                    log(area, { x: player.x, y: player.y }, "press space to cancel");

                    ui.mode = UIMode.InventoryDrop;

                    break;
                case "e":
                    log(area, { x: player.x, y: player.y }, "select item to equip");
                    log(area, { x: player.x, y: player.y }, "press space to cancel");

                    ui.mode = UIMode.InventoryEquip;

                    break;
                case "u":
                    log(area, { x: player.x, y: player.y }, "select item to unequip");
                    log(area, { x: player.x, y: player.y }, "press space to cancel");

                    ui.mode = UIMode.InventoryUnequip;

                    break;
                case "s":
                    log(area, { x: player.x, y: player.y }, "select first item to swap");
                    log(area, { x: player.x, y: player.y }, "press space to cancel");

                    ui.mode = UIMode.InventorySwapFirst;

                    break;
            }

            break;
        case UIMode.InventoryDrop:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(area, { x: player.x, y: player.y }, `${player.name} drops a ${item.name}`);

                    item.x = player.x;
                    item.y = player.y;

                    player.inventory.splice(index, 1);
                    area.items.push(item);

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventoryEquip:
            player.inventory.forEach((item) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(area, { x: player.x, y: player.y }, `${player.name} equips a ${item.name}`);

                    item.equipped = true;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventoryUnequip:
            player.inventory.forEach((item) => {
                if (ev.key === getInventoryChar(player, item)) {
                    log(area, { x: player.x, y: player.y }, `${player.name} unequips a ${item.name}`);

                    item.equipped = false;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventorySwapFirst:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    ui.inventorySwapFirst = index;

                    log(area, { x: player.x, y: player.y }, "select second item to swap");
                    log(area, { x: player.x, y: player.y }, "press space to cancel");

                    ui.mode = UIMode.InventorySwapSecond;
                }
            });

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.InventorySwapSecond:
            player.inventory.forEach((item, index) => {
                if (ev.key === getInventoryChar(player, item)) {
                    ui.inventorySwapSecond = index;

                    log(area, { x: player.x, y: player.y }, `${player.name} swaps the ${player.inventory[ui.inventorySwapFirst].name} with the ${player.inventory[ui.inventorySwapSecond].name}`);

                    const t = player.inventory[ui.inventorySwapFirst];
                    player.inventory[ui.inventorySwapFirst] = player.inventory[ui.inventorySwapSecond];
                    player.inventory[ui.inventorySwapSecond] = t;

                    ui.mode = UIMode.Default;
                }
            });

            switch (ev.key) {
                case " ":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
        case UIMode.Character:
            switch (ev.key) {
                case "o":
                    ui.mode = UIMode.Default;

                    break;
            }

            break;
    }

    switch (ev.key) {
        case "[":
            log(area, { x: player.x, y: player.y }, "game saved");

            save();

            break;
        case "]":
            log(area, { x: player.x, y: player.y }, "game loaded");

            load();

            break;
        case "\\":
            console.log(game);

            break;
        case "-":
            game.fontSize--;

            break;
        case "=":
            game.fontSize++;

            break;
        case "1":
            game.godMode = !game.godMode;

            break;
        case "2":
            game.stopTime = !game.stopTime;

            break;
        case "3":
            game.ignoreFov = !game.ignoreFov;

            break;
    }

    draw();
}
