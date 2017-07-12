import { fov } from './algorithms';
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
    target: { x: 0, y: 0 }
};

export function log(dungeon: Dungeon, location: Coord, message: string) {
    const player = getEntity(0);

    if (dungeon !== getDungeon(player)) {
        return;
    }

    if (!fov(dungeon, { x: player.x, y: player.y }, player.sight, 1, [
        CellType.Wall,
        CellType.DoorClosed
    ], coord => {
        if (coord.x !== location.x || coord.y !== location.y) {
            return;
        }

        return true;
    }).filter(hit => hit.data).length) {
        return;
    }

    ui.messages.push(message);

    if (ui.messages.length > ui.maxMessages) {
        ui.messages.shift();
    }
}
