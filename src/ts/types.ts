export interface Cell {
    type: CellType;
    discovered: boolean;
}

export enum CellType {
    Empty,
    Floor,
    Grass,
    Wall,
    DoorOpen,
    DoorClosed,
    StairsUp,
    StairsDown,
}

export interface CellInfo {
    name: string;
    char: string;
    color: string;
    solid: boolean;
}

export interface Chest extends Coord, Glyph {
    loot: Item;
}

export enum Class {
    Warrior,
    Shaman,
}

export interface Coord {
    x: number;
    y: number;
}

export interface Corpse extends Entity, Item {
    originalChar: string;
}

export enum Disposition {
    Passive,
    Aggressive,
    Cowardly,
}

export interface Dungeon {
    width: number;
    height: number;
    cells: Cell[][];
    rooms: Rect[];
    litRooms: boolean;
    entities: Entity[];
    chests: Chest[];
    items: Item[];
}

export interface Entity extends Coord, Glyph {
    id: number;
    name: string;
    level: number;
    class: Class;
    sight: number;
    inventory: Item[];
    factions: Faction[];
    hostileFactions: Faction[];
    hostileEntityIds: number[];
    disposition: Disposition;
}

export enum Faction {
    Player,
    Monster,
    Bugbear,
    Orc,
}

export interface Game {
    currentId: number;
    turn: number;
    dungeons: Dungeon[];
    fontSize: number;
    cellInfo: CellInfo[];
    messages: string[];
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

export interface Glyph {
    char: string;
    color: string;
    alpha: number;
}

export interface Item extends Coord, Glyph {
    name: string;
    equipped: boolean;
}

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Stats {
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
}

export interface UI {
    mode: string;
    maxMessages: number;
    inventorySwapFirst: number;
    inventorySwapSecond: number;
    target: Coord;
}
