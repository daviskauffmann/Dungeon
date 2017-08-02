import { calcStats, getInventoryChar } from "./actors";
import { fieldOfView } from "./algorithms";
import { config, game, ui } from "./game";
import { isInside } from "./math";
import { ActorType, CellType, Class, Corpse, Equipment, EquipmentType, ItemType, Potion, PotionType, Rect, StairDirection, UIMode } from "./types";
import { findActor } from "./world";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

export function draw(ev?: UIEvent) {
    const actorContext = findActor(0);
    const { actor, chunk, dungeon, level } = actorContext;
    const actorInfo = config.actorInfo[ActorType[actor.actorType]];

    const area = level || chunk;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const view: Rect = {
        height: 0,
        left: 0,
        top: 0,
        width: 0,
    };
    view.width = Math.round(canvas.width / game.fontSize);
    view.height = Math.round(canvas.height / game.fontSize);
    view.left = actor.x - Math.round(view.width / 2);
    view.top = actor.y - Math.round(view.height / 2);
    if (view.left < 0) {
        view.left = 0;
    }
    if (view.left + view.width > area.width) {
        view.left = area.width - view.width;
    }
    if (view.top < 0) {
        view.top = 0;
    }
    if (view.top + view.height > area.height) {
        view.top = area.height - view.height;
    }

    const visibleCells = fieldOfView(area, actor, 0.5, actorInfo.sight)
        .map((coord) => area.cells[coord.x][coord.y]);

    visibleCells.forEach((cell) => {
        cell.discovered = true;
    });

    if (game.ignoreFov) {
        for (let x = view.left; x < view.left + view.width; x++) {
            for (let y = view.top; y < view.top + view.height; y++) {
                if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                    const cell = area.cells[x][y];

                    if (visibleCells.indexOf(cell) === -1) {
                        visibleCells.push(cell);
                    }
                }
            }
        }
    }

    if (level && level.litRooms) {
        level.rooms.forEach((room) => {
            if (isInside(actor, room)) {
                for (let x = room.left - 1; x < room.left + room.width + 1; x++) {
                    for (let y = room.top - 1; y < room.top + room.height + 1; y++) {
                        if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                            const cell = area.cells[x][y];

                            cell.discovered = true;

                            if (visibleCells.indexOf(cell) === -1) {
                                visibleCells.push(cell);
                            }
                        }
                    }
                }
            }
        });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = game.fontSize + "px mono";

    for (let x = view.left; x < view.left + view.width; x++) {
        for (let y = view.top; y < view.top + view.height; y++) {
            if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                const cell = area.cells[x][y];

                const screen = {
                    x: (x - view.left) * game.fontSize,
                    y: (y - view.top + 1) * game.fontSize,
                };

                if (ui.mode === UIMode.Target) {
                    if (ui.target.x + 1 === x && ui.target.y === y) {
                        ctx.fillStyle = "#ffffff";
                        ctx.globalAlpha = 1;
                        ctx.fillText("]", screen.x, screen.y);

                        continue;
                    }
                    if (ui.target.x - 1 === x && ui.target.y === y) {
                        ctx.fillStyle = "#ffffff";
                        ctx.globalAlpha = 1;
                        ctx.fillText("[", screen.x, screen.y);

                        continue;
                    }
                }

                if (visibleCells.indexOf(cell) > -1) {
                    {
                        const actor = area.actors.find((actor) => actor.x === x && actor.y === y);

                        if (actor) {
                            const actorInfo = config.actorInfo[ActorType[actor.actorType]];
                            const classInfo = config.classInfo[Class[actor.class]];

                            ctx.fillStyle = classInfo.color;
                            ctx.globalAlpha = 1;
                            ctx.fillText(actorInfo.char, screen.x, screen.y);

                            continue;
                        }
                    }

                    {
                        const chest = area.chests.find((chest) => chest.x === x && chest.y === y);

                        if (chest) {
                            ctx.fillStyle = config.chestCommon.color;
                            ctx.globalAlpha = 1;
                            ctx.fillText(config.chestCommon.char, screen.x, screen.y);

                            continue;
                        }
                    }

                    {
                        const item = area.items.find((item) => item.x === x && item.y === y);

                        if (item) {
                            const itemInfo = config.itemInfo[ItemType[item.itemType]];

                            let color = itemInfo.color;
                            let char = itemInfo.char;

                            switch (item.itemType) {
                                case ItemType.Corpse: {
                                    const corpse = item as Corpse;
                                    const actorInfo = config.actorInfo[ActorType[corpse.actorType]];
                                    const classInfo = config.classInfo[Class[corpse.class]];

                                    color = classInfo.color;

                                    break;
                                }
                                case ItemType.Equipment: {
                                    const equipment = item as Equipment;
                                    const equipmentInfo = config.equipmentInfo[EquipmentType[equipment.equipmentType]];

                                    char = equipmentInfo.char;

                                    break;
                                }
                                case ItemType.Potion: {
                                    const potion = item as Potion;
                                    const potionInfo = config.potionInfo[PotionType[potion.potionType]];

                                    color = potionInfo.color;

                                    break;
                                }
                                case ItemType.Scroll: {
                                    break;
                                }
                            }

                            ctx.fillStyle = color;
                            ctx.globalAlpha = 1;
                            ctx.fillText(char, screen.x, screen.y);

                            continue;
                        }
                    }
                }

                {
                    const stair = level
                        ? level.stairDown && level.stairDown.x === x && level.stairDown.y === y
                            ? level.stairDown
                            : level.stairUp && level.stairUp.x === x && level.stairUp.y === y
                                ? level.stairUp
                                : undefined
                        : chunk.stairs.find((stair) => stair.x === x && stair.y === y);

                    if (stair) {
                        const stairInfo = config.stairInfo[StairDirection[stair.direction]];

                        ctx.fillStyle = config.stairCommon.color;
                        ctx.globalAlpha = visibleCells.indexOf(cell) > -1
                            ? 1
                            : cell.discovered
                                ? 0.25
                                : 0;
                        ctx.fillText(stairInfo.char, screen.x, screen.y);

                        continue;
                    }
                }

                {
                    const cellInfo = config.cellInfo[CellType[cell.type]];

                    ctx.fillStyle = cellInfo.color;
                    ctx.globalAlpha = visibleCells.indexOf(cell) > -1
                        ? 1
                        : cell.discovered
                            ? 0.25
                            : 0;
                    ctx.fillText(cellInfo.char, screen.x, screen.y);
                }
            }
        }
    }

    game.messages.forEach((message, index) => {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.fillText(message, 0, game.fontSize * (index + 1));
    });

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;
    ctx.fillText(`Chunk: (${chunk.x}, ${chunk.y}) Dungeon: ${dungeon ? chunk.dungeons.indexOf(dungeon) : "N/A"} Level: ${dungeon && level ? dungeon.levels.indexOf(level) : "N/A"} Turn: ${game.world.turn}`, 0, canvas.height);

    if (ui.mode === UIMode.Inventory
        || ui.mode === UIMode.InventoryDrink
        || ui.mode === UIMode.InventoryDrop
        || ui.mode === UIMode.InventoryEquip
        || ui.mode === UIMode.InventorySwapFirst
        || ui.mode === UIMode.InventorySwapSecond
        || ui.mode === UIMode.InventoryUnequip) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        actor.inventory.forEach((item, index) => {
            const equipment = item.itemType === ItemType.Equipment && item as Equipment;

            ctx.fillText(`${getInventoryChar(actor, item)}) ${item.name}${equipment && equipment.equipped ? " (equipped)" : ""}`, canvas.width - (game.fontSize * 10), (index + 1) * game.fontSize);
        });
    }

    if (ui.mode === UIMode.Character) {
        const stats = calcStats(actor);

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.fillText(`Health: ${stats.health}`, canvas.width - (game.fontSize * 10), game.fontSize);
        ctx.fillText(`Mana: ${stats.mana}`, canvas.width - (game.fontSize * 10), game.fontSize * 2);
    }
}
