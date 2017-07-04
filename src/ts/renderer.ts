const canvas: any = document.getElementById('game');
const ctx = canvas.getContext('2d');

function draw(ev: UIEvent, entity: Entity) {
    const dungeon = game.dungeons[entity.level];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const view: Rect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    view.width = Math.round(canvas.width / graphics.characterSize);
    view.height = Math.round(canvas.height / graphics.characterSize);
    view.x = entity.x - Math.round(view.width / 2);
    view.y = entity.y - Math.round(view.height / 2);
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
                if (x >= 0 && x < dungeon.width && y >= 0 && y < dungeon.height) {
                    cellVisibility.push(dungeon.cells[x][y]);
                }
            }
        }
    }
    for (let dir = 0; dir < 360; dir += 0.5) {
        raycast(dungeon, entity.x, entity.y, entity.stats.sight, dir, [
            'wall',
            'doorClosed'
        ], (x, y) => {
            dungeon.cells[x][y].discovered = true;

            if (cellVisibility.indexOf(dungeon.cells[x][y]) === -1) {
                cellVisibility.push(dungeon.cells[x][y]);
            }
        });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = graphics.characterSize + 'px mono';

    for (let x = view.x; x < view.x + view.width; x++) {
        for (let y = view.y; y < view.y + view.height; y++) {
            if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
                continue;
            }

            ctx.fillStyle = graphics.color.default;
            ctx.globalAlpha = 1;

            const screenX = (x - view.x) * graphics.characterSize;
            const screenY = (y - view.y + 1) * graphics.characterSize;

            if (ui.mode === 'target') {
                if (ui.target.x + 1 === x && ui.target.y === y) {
                    ctx.fillText(']', screenX, screenY);

                    continue;
                }
                if (ui.target.x - 1 === x && ui.target.y === y) {
                    ctx.fillText('[', screenX, screenY);

                    continue;
                }
            }

            if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                if (dungeon.entities.some(entity => {
                    if (entity.x !== x || entity.y !== y) {
                        return false;
                    }

                    ctx.fillText(entity.char, screenX, screenY);

                    return true;
                })) {
                    continue;
                }

                if (dungeon.chests.some(chest => {
                    if (chest.x !== x || chest.y !== y) {
                        return false;
                    }

                    ctx.fillText(chest.char, screenX, screenY);

                    return true;
                })) {
                    continue;
                }

                if (dungeon.items.some(item => {
                    if (item.x !== x || item.y !== y) {
                        return false;
                    }

                    ctx.fillText(item.char, screenX, screenY);

                    return true;
                })) {
                    continue;
                }
            }

            if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1 || dungeon.cells[x][y].discovered) {
                if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                    ctx.globalAlpha = 1;
                } else if (dungeon.cells[x][y].discovered) {
                    ctx.globalAlpha = 0.25;
                }

                let cellType = graphics.cellType[dungeon.cells[x][y].type] || graphics.cellType.default;
                ctx.fillStyle = cellType.color || graphics.color.default;
                ctx.fillText(cellType.char, screenX, screenY);
            }
        }
    }

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 1;
    ctx.fillText(game.messages[game.messages.length - 5], 0, graphics.characterSize);
    ctx.fillText(game.messages[game.messages.length - 4], 0, graphics.characterSize * 2);
    ctx.fillText(game.messages[game.messages.length - 3], 0, graphics.characterSize * 3);
    ctx.fillText(game.messages[game.messages.length - 2], 0, graphics.characterSize * 4);
    ctx.fillText(game.messages[game.messages.length - 1], 0, graphics.characterSize * 5);
    ctx.fillText('Level:' + (entity.level + 1) + ' ' + 'Turn:' + game.turn, 0, canvas.height);

    if (ui.mode.includes('inventory')) {
        for (let i = 0; i < entity.inventory.length; i++) {
            entity.inventory[i].index = String.fromCharCode(97 + i);
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width - graphics.characterSize * 10, 0, graphics.characterSize * 10, entity.inventory.length * 26);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < entity.inventory.length; i++) {
            ctx.fillText(entity.inventory[i].index + ') ' + entity.inventory[i].name + (entity.inventory[i].equipped ? ' (equipped)' : ''), canvas.width - (graphics.characterSize * 10), (i + 1) * graphics.characterSize);
        }
    }

    if (ui.mode === 'character') {
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width - graphics.characterSize * 10, 0, graphics.characterSize * 10, graphics.characterSize * 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Health: ' + entity.stats.health, canvas.width - (graphics.characterSize * 10), graphics.characterSize);
        ctx.fillText('Mana: ' + entity.stats.mana, canvas.width - (graphics.characterSize * 10), graphics.characterSize * 2);
    }
}
