import { raycast } from './algorithms';
import { CellType, Dungeon } from './dungeon';
import { getDungeon, getEntity } from './entity';
import { Coord } from './math';

export interface UI {
    mode: string;
    messages: Array<string>;
    maxMessages: number;
    inventorySwapFirst: number;
    inventorySwapSecond: number;
    target: Coord;
}

export const ui: UI = {
    mode: '',
    messages: [],
    maxMessages: 10,
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: {
        x: 0,
        y: 0
    }
};

export function log(dungeon: Dungeon, location: Coord, message: string) {
    const player = getEntity(0);
    
    if (dungeon !== getDungeon(player)) {
        return;
    }

    if ((() => {
        for (let dir = 0; dir < 360; dir++) {
            if (raycast(dungeon, { x: player.x, y: player.y }, player.sight, dir, [
                CellType.Wall,
                CellType.DoorClosed
            ], (x, y) => {
                if (x !== location.x || y !== location.y) {
                    return;
                }

                return true;
            })) {
                return false;
            }
        }

        return true;
    })()) {
        return;
    }

    ui.messages.push(message);

    if (ui.messages.length > ui.maxMessages) {
        ui.messages.shift();
    }
}
