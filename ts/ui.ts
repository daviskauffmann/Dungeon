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
}
