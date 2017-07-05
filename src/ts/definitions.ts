interface Cell {
    type: CellType;
    discovered: boolean;
}

enum CellType {
    Empty,
    Floor,
    Grass,
    Wall,
    DoorClosed,
    DoorOpen,
    StairsDown,
    StairsUp
}

interface Chest extends Coord, Glyph {
    loot: Item;
}

enum Class {
    Warrior,
    Shaman
}

enum Color {
    Default
}

interface Coord {
    x: number;
    y: number;
}

interface Corpse extends Entity, Item {
    originalChar: string;
}

interface Size {
    width: number;
    height: number;
}

interface Dungeon extends Size {
    cells: Array<Array<Cell>>;
    rooms: Array<Rect>;
    litRooms: boolean;
    entities: Array<Entity>;
    chests: Array<Chest>;
    items: Array<Item>;
}

enum Disposition {
    Passive,
    Aggressive,
    Cowardly
}

interface Entity extends Coord, Glyph {
    id: number;
    name: string;
    level: number;
    class: Class;
    stats: Stats;
    inventory: Array<Item>;
    factions: Array<string>;
    hostileFactions: Array<string>;
    hostileEntities: Array<number>;
    disposition: Disposition;
}

interface Game {
    currentId: number;
    dungeons: Array<Dungeon>;
    turn: number;
    messages: Array<string>;
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

interface Glyph {
    char: string;
    color: string;
    alpha: number;
}

interface Graphics {
    fontSize: number;
    cellTypes: Array<Glyph>;
}

interface Item extends Coord, Glyph {
    name: string;
    index: string;
    equipped: boolean;
}

interface Rect extends Coord, Size { }

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
