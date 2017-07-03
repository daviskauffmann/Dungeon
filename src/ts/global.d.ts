interface Cell {
    type: string;
    discovered: boolean;
}

interface Chest {
    x: number;
    y: number;
    char: string;
    loot: Item;
}

interface Coord {
    x: number;
    y: number;
}

interface Dungeon {
    width: number;
    height: number;
    cells: Array<Array<Cell>>;
    rooms: Array<Rect>;
    entities: Array<Entity>;
    chests: Array<Chest>;
    items: Array<Item>;
}

interface Entity {
    id: number;
    x: number;
    y: number;
    name: string;
    char: string;
    level: number;
    stats: Stats;
    inventory: Array<Item>;
    factions: Array<string>;
    hostileFactions: Array<string>;
    hostileEntities: Array<number>;
}

interface Game {
    id: number;
    dungeons: Array<Dungeon>;
    turn: number;
    messages: Array<string>;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

interface Item {
    x: number;
    y: number;
    name: string;
    char: string;
    index: string;
    equipped: boolean;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Stats {
    level: number;

    health: number;
    energy: number;
    mana: number;

    stamina: number;
    endurance: number;
    attunement: number;
    resistance: number;
    strength: number;
    intellect: number;
    avoidance: number;
    precision: number;
    charisma: number;
    luck: number;

    sight: number;
}

interface UI {
    mode: string;
    inventorySwapFirst: number;
    inventorySwapSecond: number;
    target: Coord;
}

interface View {
    x: number;
    y: number;
    width: number;
    height: number;
    characterSize: number;
    color: {
        default: string;
    };
    cellType: {
        [key: string]: {
            color?: string;
            char: string;
        };
    };
}
