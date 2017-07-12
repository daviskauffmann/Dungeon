import { raycast } from './algorithms';
import { Cell, CellType } from './dungeon';
import { calcStats, Entity, getDungeon, getEntity, getInventoryChar, getLevel } from './entity';
import { game } from './game';
import { isInside, Rect } from './math';
import { ui } from './ui';

export interface Glyph {
    char: string;
    color: string;
    alpha: number;
}

export interface Graphics {
    fontSize: number;
    cellTypes: Array<Glyph>;
}

const canvas = <HTMLCanvasElement>document.getElementById('game');
const ctx = canvas.getContext('2d');
export const graphics: Graphics = {
    fontSize: 24,
    cellTypes: [
        { char: ' ', color: '#ffffff', alpha: 1 },
        { char: '.', color: '#ffffff', alpha: 1 },
        { char: '^', color: '#50ff50', alpha: 1 },
        { char: '#', color: '#ffffff', alpha: 1 },
        { char: '-', color: '#ffffff', alpha: 1 },
        { char: '+', color: '#ffffff', alpha: 1 },
        { char: '<', color: '#ffffff', alpha: 1 },
        { char: '>', color: '#ffffff', alpha: 1 }
    ]
};

export function draw(ev: UIEvent) {
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
    view.width = Math.round(canvas.width / graphics.fontSize);
    view.height = Math.round(canvas.height / graphics.fontSize);
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

    const cellVisibility: Array<Cell> = [];
    if (game.ignoreFov) {
        for (let x = view.x; x < view.x + view.width; x++) {
            for (let y = view.y; y < view.y + view.height; y++) {
                if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
                    continue;
                }

                if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                    continue;
                }

                cellVisibility.push(dungeon.cells[x][y]);
            }
        }
    }
    for (let dir = 0; dir < 360; dir += 0.5) {
        raycast(dungeon, { x: player.x, y: player.y }, player.sight, dir, [
            CellType.Wall,
            CellType.DoorClosed
        ], (x, y) => {
            dungeon.cells[x][y].discovered = true;

            if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                return;
            }

            cellVisibility.push(dungeon.cells[x][y]);
        });
    }
    if (dungeon.litRooms) {
        dungeon.rooms.forEach(room => {
            if (!isInside({ x: player.x, y: player.y }, room)) {
                return;
            }

            for (let x = room.x - 1; x < room.x + room.width + 1; x++) {
                for (let y = room.y - 1; y < room.y + room.height + 1; y++) {
                    if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
                        continue;
                    }

                    dungeon.cells[x][y].discovered = true;

                    if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                        continue;
                    }

                    cellVisibility.push(dungeon.cells[x][y]);
                }
            }
        });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = graphics.fontSize + 'px mono';

    for (let x = view.x; x < view.x + view.width; x++) {
        for (let y = view.y; y < view.y + view.height; y++) {
            if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
                continue;
            }

            const screen = {
                x: (x - view.x) * graphics.fontSize,
                y: (y - view.y + 1) * graphics.fontSize
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

            if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                if (dungeon.entities.some(entity => {
                    if (entity.x !== x || entity.y !== y) {
                        return false;
                    }

                    ctx.fillStyle = entity.color;
                    ctx.globalAlpha = entity.alpha;
                    ctx.fillText(entity.char, screen.x, screen.y);

                    return true;
                }) || dungeon.chests.some(chest => {
                    if (chest.x !== x || chest.y !== y) {
                        return false;
                    }

                    ctx.fillStyle = chest.color;
                    ctx.globalAlpha = chest.alpha;
                    ctx.fillText(chest.char, screen.x, screen.y);

                    return true;
                }) || dungeon.items.sort((a, b) => {
                    return 0;
                }).some(item => {
                    if (item.x !== x || item.y !== y) {
                        return false;
                    }

                    ctx.fillStyle = item.color;
                    ctx.globalAlpha = item.alpha;
                    ctx.fillText(item.char, screen.x, screen.y);

                    return true;
                })) {
                    continue;
                }
            }

            let cellType = graphics.cellTypes[dungeon.cells[x][y].type];
            ctx.fillStyle = cellType.color;
            ctx.globalAlpha = cellVisibility.indexOf(dungeon.cells[x][y]) > -1 ? cellType.alpha : dungeon.cells[x][y].discovered ? cellType.alpha * 0.25 : 0;
            ctx.fillText(cellType.char, screen.x, screen.y);
        }
    }

    for (let i = 0; i < ui.messages.length; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fillText(ui.messages[i], 0, graphics.fontSize * (i + 1));
    }

    ctx.fillStyle = '#ffffff';

    ctx.fillText(`Level: ${getLevel(player)} Turn: ${game.turn}`, 0, canvas.height);

    if (ui.mode.includes('inventory')) {
        ctx.fillStyle = '#ffffff';
        player.inventory.forEach((item, index) => {
            ctx.fillText(`${getInventoryChar(player, item)}) ${item.name}${item.equipped ? ' (equipped)' : ''}`, canvas.width - (graphics.fontSize * 10), (index + 1) * graphics.fontSize);
        });
    }

    if (ui.mode === 'character') {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Health: ${calcStats(player).health}`, canvas.width - (graphics.fontSize * 10), graphics.fontSize);
        ctx.fillText(`Mana: ${calcStats(player).mana}`, canvas.width - (graphics.fontSize * 10), graphics.fontSize * 2);
    }
}
