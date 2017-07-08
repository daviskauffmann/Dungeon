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
    game.messages.push(message);

    if (game.messages.length > ui.maxMessages) {
        game.messages.shift();
    }
}
