/// <reference path="main.js" />

function draw() {
    const player = getPlayer();
    const dungeon = game.dungeons[player.level];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    view.width = Math.round(canvas.width / view.characterSize);
    view.height = Math.round(canvas.height / view.characterSize);
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

    const cellVisibility = [];
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
        raycast(dungeon, player.x, player.y, player.stats.sight, dir, [
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
    ctx.font = view.characterSize + 'px mono';

    for (let x = view.x; x < view.x + view.width; x++) {
        for (let y = view.y; y < view.y + view.height; y++) {
            if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
                continue;
            }

            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 1;

            const screenX = (x - view.x) * view.characterSize;
            const screenY = (y - view.y + 1) * view.characterSize;

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

                    ctx.fillText('~', screenX, screenY);

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
                ctx.fillStyle = '#fff';
                if (cellVisibility.indexOf(dungeon.cells[x][y]) > -1) {
                    ctx.globalAlpha = 1;
                } else if (dungeon.cells[x][y].discovered) {
                    ctx.globalAlpha = 0.25;
                }

                switch (dungeon.cells[x][y].type) {
                    case 'empty':
                        ctx.fillText(' ', screenX, screenY);
                        break;
                    case 'floor':
                        ctx.fillText('.', screenX, screenY);
                        break;
                    case 'grass':
                        ctx.fillStyle = '#50ff50';
                        ctx.fillText('^', screenX, screenY);
                        break;
                    case 'wall':
                        ctx.fillText('#', screenX, screenY);
                        break;
                    case 'doorClosed':
                        ctx.fillText('+', screenX, screenY);
                        break;
                    case 'doorOpen':
                        ctx.fillText('-', screenX, screenY);
                        break;
                    case 'stairsUp':
                        ctx.fillText('<', screenX, screenY);
                        break;
                    case 'stairsDown':
                        ctx.fillText('>', screenX, screenY);
                        break;
                    case 'trap':
                        ctx.fillText('^', screenX, screenY);
                        break;
                }
            }
        }
    }

    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 1;
    ctx.fillText(game.messages[game.messages.length - 5], 0, view.characterSize);
    ctx.fillText(game.messages[game.messages.length - 4], 0, view.characterSize * 2);
    ctx.fillText(game.messages[game.messages.length - 3], 0, view.characterSize * 3);
    ctx.fillText(game.messages[game.messages.length - 2], 0, view.characterSize * 4);
    ctx.fillText(game.messages[game.messages.length - 1], 0, view.characterSize * 5);
    ctx.fillText('Level:' + (player.level + 1) + ' ' + 'Turn:' + game.turn, 0, canvas.height);

    if (ui.mode.includes('inventory')) {
        for (let i = 0; i < player.inventory.length; i++) {
            player.inventory[i].index = String.fromCharCode(97 + i);
        }
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width - view.characterSize * 10, 0, view.characterSize * 10, player.inventory.length * 26);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < player.inventory.length; i++) {
            ctx.fillText(player.inventory[i].index + ') ' + player.inventory[i].name + (player.inventory[i].equipped ? ' (equipped)' : ''), canvas.width - (view.characterSize * 10), (i + 1) * view.characterSize);
        }
    }

    if (ui.mode === 'character') {
        ctx.fillStyle = '#000';
        ctx.fillRect(canvas.width - view.characterSize * 10, 0, view.characterSize * 10, view.characterSize * 10);
        ctx.fillStyle = '#fff';
        ctx.fillText('Health: ' + player.stats.health, canvas.width - (view.characterSize * 10), view.characterSize);
        ctx.fillText('Mana: ' + player.stats.mana, canvas.width - (view.characterSize * 10), view.characterSize * 2);
    }
}
