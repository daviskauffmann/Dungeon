import { fieldOfView } from './algorithms';
import { Cell, CellType } from './dungeon';
import { calcStats, Entity, getDungeon, getEntity, getInventoryChar, getLevel } from './entity';
import { game, ui } from './game';
import { isInside, Rect } from './math';

export interface Glyph {
    char: string;
    color: string;
    alpha: number;
}

const canvas = <HTMLCanvasElement>document.getElementById('game');
const ctx = canvas.getContext('2d');

export function draw(ev?: UIEvent) {
    const player = getEntity(0);
    const dungeon = getDungeon(player);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const view: Rect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    view.width = Math.round(canvas.width / game.fontSize);
    view.height = Math.round(canvas.height / game.fontSize);
    view.x = player.x - Math.round(view.width / 2);
    view.y = player.y - Math.round(view.height / 2);
    if (view.x < 0) {
        view.x = 0;
    }
    if (view.x + view.width > dungeon.width) {
        view.x = dungeon.width - view.width;
    }
    if (view.y < 0) {
        view.y = 0;
    }
    if (view.y + view.height > dungeon.height) {
        view.y = dungeon.height - view.height;
    }

    const visibleCells = fieldOfView(dungeon, { x: player.x, y: player.y }, player.sight, 0.5).map(coord => dungeon.cells[coord.x][coord.y]);

    visibleCells.forEach(cell => {
        cell.discovered = true;
    });

    if (game.ignoreFov) {
        for (let x = view.x; x < view.x + view.width; x++) {
            for (let y = view.y; y < view.y + view.height; y++) {
                if (x >= 0 && x < dungeon.width && y >= 0 && y < dungeon.height
                    && visibleCells.indexOf(dungeon.cells[x][y]) === -1) {
                    visibleCells.push(dungeon.cells[x][y]);
                }
            }
        }
    }

    if (dungeon.litRooms) {
        dungeon.rooms.forEach(room => {
            if (isInside({ x: player.x, y: player.y }, room)) {
                for (let x = room.x - 1; x < room.x + room.width + 1; x++) {
                    for (let y = room.y - 1; y < room.y + room.height + 1; y++) {
                        if (x >= 0 && x < dungeon.width && y >= 0 && y < dungeon.height) {
                            dungeon.cells[x][y].discovered = true;

                            if (visibleCells.indexOf(dungeon.cells[x][y]) === -1) {
                                visibleCells.push(dungeon.cells[x][y]);
                            }
                        }
                    }
                }
            }
        });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = game.fontSize + 'px mono';

    for (let x = view.x; x < view.x + view.width; x++) {
        for (let y = view.y; y < view.y + view.height; y++) {
            if (x >= 0 && x < dungeon.width && y >= 0 && y < dungeon.height) {
                const screen = {
                    x: (x - view.x) * game.fontSize,
                    y: (y - view.y + 1) * game.fontSize
                }

                if (ui.mode === 'target') {
                    if (ui.target.x + 1 === x && ui.target.y === y) {
                        ctx.fillStyle = '#ffffff';
                        ctx.globalAlpha = 1;
                        ctx.fillText(']', screen.x, screen.y);

                        continue;
                    }
                    if (ui.target.x - 1 === x && ui.target.y === y) {
                        ctx.fillStyle = '#ffffff';
                        ctx.globalAlpha = 1;
                        ctx.fillText('[', screen.x, screen.y);

                        continue;
                    }
                }

                if (visibleCells.indexOf(dungeon.cells[x][y]) > -1) {
                    if (dungeon.entities.some(entity => {
                        if (entity.x === x && entity.y === y) {
                            ctx.fillStyle = entity.color;
                            ctx.globalAlpha = entity.alpha;
                            ctx.fillText(entity.char, screen.x, screen.y);

                            return true;
                        }
                    }) || dungeon.chests.some(chest => {
                        if (chest.x === x && chest.y === y) {
                            ctx.fillStyle = chest.color;
                            ctx.globalAlpha = chest.alpha;
                            ctx.fillText(chest.char, screen.x, screen.y);

                            return true;
                        }
                    }) || dungeon.items.sort((a, b) => {
                        return 0;
                    }).some(item => {
                        if (item.x === x && item.y === y) {
                            ctx.fillStyle = item.color;
                            ctx.globalAlpha = item.alpha;
                            ctx.fillText(item.char, screen.x, screen.y);

                            return true;
                        }
                    })) {
                        continue;
                    }
                }

                let cellInfo = game.cellInfo[dungeon.cells[x][y].type];
                ctx.fillStyle = cellInfo.color;
                ctx.globalAlpha = visibleCells.indexOf(dungeon.cells[x][y]) > -1 ? 1 : dungeon.cells[x][y].discovered ? 0.25 : 0;
                ctx.fillText(cellInfo.char, screen.x, screen.y);
            }
        }
    }

    game.messages.forEach((message, index) => {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fillText(message, 0, game.fontSize * (index + 1));
    });

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Level: ${getLevel(player)} Turn: ${game.turn}`, 0, canvas.height);

    if (ui.mode.includes('inventory')) {
        ctx.fillStyle = '#ffffff';
        player.inventory.forEach((item, index) => {
            ctx.fillText(`${getInventoryChar(player, item)}) ${item.name}${item.equipped ? ' (equipped)' : ''}`, canvas.width - (game.fontSize * 10), (index + 1) * game.fontSize);
        });
    }

    if (ui.mode === 'character') {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Health: ${calcStats(player).health}`, canvas.width - (game.fontSize * 10), game.fontSize);
        ctx.fillText(`Mana: ${calcStats(player).mana}`, canvas.width - (game.fontSize * 10), game.fontSize * 2);
    }
}
