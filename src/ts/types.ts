export interface Actor extends Coord {
    id: number;
    actorType: ActorType;
    name: string;
    class: Class;
    level: number;
    experience: number;
    health: number;
    energy: number;
    mana: number;
    inventory: Item[];
    hostileActorIds: number[];
}

export interface ActorContext extends Context {
    actor: Actor;
}

export enum ActorType {
    Player,
    Rat,
    Slime,
    Orc,
    Bugbear,
}

export interface Area {
    width: number;
    height: number;
    cells: Cell[][];
    actors: Actor[];
    chests: Chest[];
    items: Item[];
}

export interface Cell {
    type: CellType;
    discovered: boolean;
}

export enum CellType {
    DoorClosed,
    DoorOpen,
    Empty,
    Floor,
    Grass,
    Wall,
}

export interface Chest extends Coord {
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
    None,
    Warrior,
    Shaman,
}

export interface Config {
    actorInfo: {
        [key: string]: {
            char: string;
            disposition: Disposition;
            factions: Faction[];
            hostileFactions: Faction[];
            sight: number;
        };
    };
    cellInfo: {
        [key: string]: {
            char: string;
            color: string;
            solid: boolean;
        };
    };
    chestCommon: {
        char: string;
        color: string;
    };
    classInfo: {
        [key: string]: {
            color: string;
        };
    };
    equipmentInfo: {
        [key: string]: {
            char?: string;
            color?: string;
        };
    };
    itemInfo: {
        [key: string]: {
            char?: string;
            color?: string;
        };
    };
    potionInfo: {
        [key: string]: {
            char?: string;
            color?: string;
        };
    };
    stairCommon: {
        color: string;
    };
    stairInfo: {
        [key: string]: {
            char: string;
        };
    };
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

export interface Corpse extends Actor, Item { }

export enum Disposition {
    Passive,
    Aggressive,
    Cowardly,
}

export interface Dungeon {
    name: string;
    levels: Level[];
    maxLevels: number;
}

export interface DungeonOptions {
    name?: string;
    maxLevels?: number;
}

export interface Equipment extends Item {
    equipmentType: EquipmentType;
    equipped: boolean;
}

export enum EquipmentType {
    Sword,
    Spear,
    Shield,
    Bow,
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

export enum Faction {
    Player,
    Monster,
    Bugbear,
    Orc,
}

export interface Game {
    world: World;
    fontSize: number;
    messages: string[];
    godMode: boolean;
    stopTime: boolean;
    ignoreFov: boolean;
}

export interface Item extends Coord {
    itemType: ItemType;
    name: string;
}

export enum ItemType {
    Equipment,
    Potion,
    Scroll,
    Corpse,
}

export interface Potion extends Item {
    potionType: PotionType;
}

export enum PotionType {
    Health,
    Energy,
    Mana,
}

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Scroll extends Item {
    scrollType: ScrollType;
}

export enum ScrollType {
    Unused,
}

export interface Stair extends Coord {
    id: number;
    direction: StairDirection;
}

export interface StairContext extends Context {
    stair: Stair;
}

export enum StairDirection {
    Down,
    Up,
}

export interface Stats {
    health: number; // max health
    energy: number; // max energy
    mana: number; // max mana

    stamina: number; // health
    endurance: number; // energy
    attunement: number; // mana
    resistance: number; // % damage resist
    strength: number; // physical damage
    intellect: number; // magic damage
    avoidance: number; // % chance to avoid damage
    precision: number; // % chance to crit
    charisma: number; // RP
    luck: number; // all stats, item find

    armor: number; // % physical damage resist
    encumbrance: number; // max weight carried
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

export interface World {
    chunks: {
        [key: string]: Chunk;
    };
    currentActorId: number;
    currentStairId: number;
    turn: number;
}
