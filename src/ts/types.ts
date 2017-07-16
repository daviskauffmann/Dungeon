export interface Area {
    width: number;
    height: number;
    cells: Cell[][];
    entities: Entity[];
    chests: Chest[];
    items: Item[];
}

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

export interface Chunk extends Area {
    dungeons: Dungeon[];
    stairsDown: Stair[];
}

export interface ChunkOptions {
    width?: number;
    height?: number;
    dungeonAmount?: number;
}

export enum Class {
    Warrior,
    Shaman,
}

export interface Context {
    chunk: Chunk;
    dungeon?: Dungeon;
    level?: Level;
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
    levels: Level[];
}

export interface Level extends Area {
    rooms: Rect[];
    litRooms: boolean;
    stairDown: Stair;
    stairUp: Stair;
}

export interface LevelOptions {
    width?: number;
    height?: number;
    roomAttempts?: number;
    minRoomSize?: number;
    maxRoomSize?: number;
    preventOverlap?: boolean;
    litRooms?: boolean;
    doorChance?: number;
    monsterAmount?: number;
    chestAmount?: number;
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

export interface EntityContext extends Context {
    entity: Entity;
}

export enum Faction {
    Player,
    Monster,
    Bugbear,
    Orc,
}

export interface Game {
    chunks: Chunk[][];
    currentEntityId: number;
    currentStairId: number;
    turn: number;
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

export interface Stair extends Coord {
    id: number;
    direction: StairDirection;
}

export interface StairContext extends Context {
    stairs: Stair;
}

export enum StairDirection {
    Down,
    Up,
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
    mode: UIMode;
    maxMessages: number;
    inventorySwapFirst: number;
    inventorySwapSecond: number;
    target: Coord;
}

export enum UIMode {
    Default,
    Target,
    Inventory,
    InventoryDrop,
    InventoryEquip,
    InventoryUnequip,
    InventorySwapFirst,
    InventorySwapSecond,
    Character,
}
