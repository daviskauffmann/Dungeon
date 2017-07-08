function tick() {
    if (game.stopTime) {
        return;
    }

    game.dungeons.forEach(dungeon => {
        dungeon.entities.forEach(entity => {
            if (entity.id === 0) {
                return;
            }

            think(entity);
        });
    });

    game.turn++;
}

function log(message: string) {
    ui.messages.push(message);

    if (ui.messages.length > ui.maxMessages) {
        ui.messages.shift();
    }
}
