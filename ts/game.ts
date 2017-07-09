export interface Game {
    currentId: number;
    dungeons: Array<Dungeon>;
    turn: number;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

export let game: Game = {
    currentId: 0,
    dungeons: [],
    turn: 0,
    godMode: true,
    stopTime: false,
    ignoreFov: false
}

export function tick() {
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

export function log(message: string) {
    ui.messages.push(message);

    if (ui.messages.length > ui.maxMessages) {
        ui.messages.shift();
    }
}
