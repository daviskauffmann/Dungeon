import { calcStats, getInventoryChar } from "./actors";
import { fieldOfView } from "./algorithms";
import { config, game, ui } from "./game";
import { isInside } from "./math";
import { Actor, ActorContext, Chunk, Corpse, Dungeon, Level, Rect, Stair, UIMode } from "./types";
import { findActor } from "./utils";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

export function draw(ev?: UIEvent) {
    const playerContext = findActor(0);
    const player = playerContext.actor;
    const chunk = playerContext.chunk;
    const dungeon = playerContext.dungeon;
    const level = playerContext.level;
    const area = level || chunk;
    const playerInfo = config.actorInfo[player.actorType];

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
    view.left = player.x - Math.round(view.width / 2);
    view.top = player.y - Math.round(view.height / 2);
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

    const visibleCells = fieldOfView(area, player, 0.5, playerInfo.sight)
        .map((coord) => area.cells[coord.x][coord.y]);

    visibleCells.forEach((cell) => {
        cell.discovered = true;
    });

    if (game.ignoreFov) {
        for (let x = view.left; x < view.left + view.width; x++) {
            for (let y = view.top; y < view.top + view.height; y++) {
                if (x >= 0 && x < area.width && y >= 0 && y < area.height
                    && visibleCells.indexOf(area.cells[x][y]) === -1) {
                    visibleCells.push(area.cells[x][y]);
                }
            }
        }
    }

    if (level && level.litRooms) {
        level.rooms.forEach((room) => {
            if (isInside({ x: player.x, y: player.y }, room)) {
                for (let x = room.left - 1; x < room.left + room.width + 1; x++) {
                    for (let y = room.top - 1; y < room.top + room.height + 1; y++) {
                        if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                            area.cells[x][y].discovered = true;

                            if (visibleCells.indexOf(area.cells[x][y]) === -1) {
                                visibleCells.push(area.cells[x][y]);
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

                if (visibleCells.indexOf(area.cells[x][y]) > -1) {
                    if (area.actors.some((actor) => {
                        if (actor.x === x && actor.y === y) {
                            const actorInfo = config.actorInfo[actor.actorType];
                            const classInfo = config.classInfo[actor.class];

                            ctx.fillStyle = classInfo.color;
                            ctx.globalAlpha = 1;
                            ctx.fillText(actorInfo.char, screen.x, screen.y);

                            return true;
                        }
                    })) {
                        continue;
                    }

                    if (area.chests.some((chest) => {
                        if (chest.x === x && chest.y === y) {
                            ctx.fillStyle = "#ffffff";
                            ctx.globalAlpha = 1;
                            ctx.fillText("~", screen.x, screen.y);

                            return true;
                        }
                    })) {
                        continue;
                    }

                    if (area.items.sort((a, b) => {
                        return 0;
                    }).some((item) => {
                        if (item.x === x && item.y === y) {
                            const itemInfo = config.itemInfo[item.itemType];

                            ctx.fillStyle = ("class" in item) ? config.classInfo[(item as Corpse).class].color : "#ffffff";
                            ctx.globalAlpha = 1;
                            ctx.fillText(itemInfo.char, screen.x, screen.y);

                            return true;
                        }
                    })) {
                        continue;
                    }
                }

                {
                    let stair: Stair;

                    if (level) {
                        if (level.stairDown
                            && level.stairDown.x === x && level.stairDown.y === y) {
                            stair = level.stairDown;
                        }
                        if (level.stairUp.x === x && level.stairUp.y === y) {
                            stair = level.stairUp;
                        }
                    } else {
                        chunk.stairsDown.forEach((stairDown) => {
                            if (stairDown.x === x && stairDown.y === y) {
                                stair = stairDown;

                                return;
                            }
                        });
                    }

                    if (stair) {
                        const stairInfo = config.stairInfo[stair.direction];
                        ctx.fillStyle = stairInfo.color;
                        ctx.globalAlpha = visibleCells.indexOf(area.cells[x][y]) > -1 ? 1
                            : area.cells[x][y].discovered ? 0.25
                                : 0;
                        ctx.fillText(stairInfo.char, screen.x, screen.y);

                        continue;
                    }
                }

                const cellInfo = config.cellInfo[area.cells[x][y].type];
                ctx.fillStyle = cellInfo.color;
                ctx.globalAlpha = visibleCells.indexOf(area.cells[x][y]) > -1 ? 1
                    : area.cells[x][y].discovered ? 0.25
                        : 0;
                ctx.fillText(cellInfo.char, screen.x, screen.y);
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
    ctx.fillText(`Dungeon: ${dungeon ? chunk.dungeons.indexOf(dungeon) : "N/A"} Level: ${dungeon && level ? dungeon.levels.indexOf(level) : "N/A"} Turn: ${game.turn}`, 0, canvas.height);

    if (ui.mode === UIMode.Inventory
        || ui.mode === UIMode.InventoryDrop
        || ui.mode === UIMode.InventoryEquip
        || ui.mode === UIMode.InventorySwapFirst
        || ui.mode === UIMode.InventorySwapSecond
        || ui.mode === UIMode.InventoryUnequip) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        player.inventory.forEach((item, index) => {
            ctx.fillText(`${getInventoryChar(player, item)}) ${item.name}${item.equipped ? " (equipped)" : ""}`, canvas.width - (game.fontSize * 10), (index + 1) * game.fontSize);
        });
    }

    if (ui.mode === UIMode.Character) {
        const stats = calcStats(player);

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.fillText(`Health: ${stats.health}`, canvas.width - (game.fontSize * 10), game.fontSize);
        ctx.fillText(`Mana: ${stats.mana}`, canvas.width - (game.fontSize * 10), game.fontSize * 2);
    }
}
