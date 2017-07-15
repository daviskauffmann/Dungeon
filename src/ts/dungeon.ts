import { game } from "./game";
import { randomFloat, randomInt } from "./math";
import { CellType, Chunk, Class, Coord, Disposition, Entity, Faction, Item, Level, Rect } from "./types";

export function createLevel(width: number, height: number, roomAttempts: number, minRoomSize: number, maxRoomSize: number, preventOverlap: boolean, litRooms: boolean, doorChance: number, trapAmount: number, monsterAmount: number, chestAmount: number) {
    const level: Level = {
        cells: [],
        chests: [],
        entities: [],
        height,
        items: [],
        litRooms,
        rooms: [],
        width,
    };

    for (let x = 0; x < level.width; x++) {
        level.cells[x] = [];
        for (let y = 0; y < level.height; y++) {
            level.cells[x][y] = {
                discovered: false,
                type: CellType.Empty,
            };
        }
    }

    for (let i = 0; i < roomAttempts || level.rooms.length < 2; i++) {
        const room: Rect = {
            height: randomInt(minRoomSize, maxRoomSize),
            left: randomInt(0, level.width),
            top: randomInt(0, level.height),
            width: randomInt(minRoomSize, maxRoomSize),
        };

        if (room.left < 1 || room.left + room.width > level.width - 1 || room.top < 1
            || room.top + room.height > level.height - 1) {
            continue;
        }

        if (preventOverlap && (() => {
            for (let x = room.left; x < room.left + room.width; x++) {
                for (let y = room.top; y < room.top + room.height; y++) {
                    if (level.cells[x][y].type === CellType.Floor) {
                        return true;
                    }
                    if (level.cells[x][y - 1].type === CellType.Floor) {
                        return true;
                    }
                    if (level.cells[x + 1][y].type === CellType.Floor) {
                        return true;
                    }
                    if (level.cells[x][y + 1].type === CellType.Floor) {
                        return true;
                    }
                    if (level.cells[x - 1][y].type === CellType.Floor) {
                        return true;
                    }
                }
            }
        })()) {
            continue;
        }

        for (let x = room.left; x < room.left + room.width; x++) {
            for (let y = room.top; y < room.top + room.height; y++) {
                level.cells[x][y].type = CellType.Floor;
            }
        }

        level.rooms.push(room);
    }

    for (let i = 0; i < level.rooms.length - 1; i++) {
        let x1 = randomInt(level.rooms[i].left, level.rooms[i].left + level.rooms[i].width);
        let y1 = randomInt(level.rooms[i].top, level.rooms[i].top + level.rooms[i].height);
        let x2 = randomInt(level.rooms[i + 1].left, level.rooms[i + 1].left + level.rooms[i + 1].width);
        let y2 = randomInt(level.rooms[i + 1].top, level.rooms[i + 1].top + level.rooms[i + 1].height);

        if (x1 > x2) {
            const t = x1;
            x1 = x2;
            x2 = t;
        }
        if (y1 > y2) {
            const t = y1;
            y1 = y2;
            y2 = t;
        }

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (x === x1 || x === x2 || y === y1 || y === y2) {
                    level.cells[x][y].type = CellType.Floor;
                }
            }
        }
    }

    for (let x = 0; x < level.width; x++) {
        for (let y = 0; y < level.height; y++) {
            if (level.cells[x][y].type === CellType.Floor) {
                if (level.cells[x][y - 1].type === CellType.Empty) {
                    level.cells[x][y - 1].type = CellType.Wall;
                }
                if (level.cells[x + 1][y - 1].type === CellType.Empty) {
                    level.cells[x + 1][y - 1].type = CellType.Wall;
                }
                if (level.cells[x + 1][y].type === CellType.Empty) {
                    level.cells[x + 1][y].type = CellType.Wall;
                }
                if (level.cells[x + 1][y + 1].type === CellType.Empty) {
                    level.cells[x + 1][y + 1].type = CellType.Wall;
                }
                if (level.cells[x][y + 1].type === CellType.Empty) {
                    level.cells[x][y + 1].type = CellType.Wall;
                }
                if (level.cells[x - 1][y - 1].type === CellType.Empty) {
                    level.cells[x - 1][y - 1].type = CellType.Wall;
                }
                if (level.cells[x - 1][y].type === CellType.Empty) {
                    level.cells[x - 1][y].type = CellType.Wall;
                }
                if (level.cells[x - 1][y + 1].type === CellType.Empty) {
                    level.cells[x - 1][y + 1].type = CellType.Wall;
                }
            }
        }
    }

    for (let x = 0; x < level.width; x++) {
        for (let y = 0; y < level.height; y++) {
            if (level.cells[x][y].type === CellType.Floor
                && randomFloat(0, 1) < doorChance) {

                if (level.cells[x][y - 1].type === CellType.Floor
                    && level.cells[x + 1][y - 1].type === CellType.Floor
                    && level.cells[x - 1][y - 1].type === CellType.Floor) {
                    if (level.cells[x - 1][y].type === CellType.Wall
                        && level.cells[x + 1][y].type === CellType.Wall) {
                        level.cells[x][y].type = CellType.DoorClosed;
                    }
                }
                if (level.cells[x + 1][y].type === CellType.Floor
                    && level.cells[x + 1][y - 1].type === CellType.Floor
                    && level.cells[x + 1][y + 1].type === CellType.Floor) {
                    if (level.cells[x][y + 1].type === CellType.Wall
                        && level.cells[x][y - 1].type === CellType.Wall) {
                        level.cells[x][y].type = CellType.DoorClosed;
                    }
                }
                if (level.cells[x][y + 1].type === CellType.Floor
                    && level.cells[x + 1][y + 1].type === CellType.Floor
                    && level.cells[x - 1][y + 1].type === CellType.Floor) {
                    if (level.cells[x - 1][y].type === CellType.Wall
                        && level.cells[x + 1][y].type === CellType.Wall) {
                        level.cells[x][y].type = CellType.DoorClosed;
                    }
                }
                if (level.cells[x - 1][y].type === CellType.Floor
                    && level.cells[x - 1][y - 1].type === CellType.Floor
                    && level.cells[x - 1][y + 1].type === CellType.Floor) {
                    if (level.cells[x][y + 1].type === CellType.Wall
                        && level.cells[x][y - 1].type === CellType.Wall) {
                        level.cells[x][y].type = CellType.DoorClosed;
                    }
                }
            }
        }
    }

    {
        const coord: Coord = {
            x: randomInt(level.rooms[0].left, level.rooms[0].left + level.rooms[0].width),
            y: randomInt(level.rooms[0].top, level.rooms[0].top + level.rooms[0].height),
        };
        level.cells[coord.x][coord.y].type = CellType.StairsUp;
    }

    {
        const coord: Coord = {
            x: randomInt(level.rooms[level.rooms.length - 1].left, level.rooms[level.rooms.length - 1].left + level.rooms[level.rooms.length - 1].width),
            y: randomInt(level.rooms[level.rooms.length - 1].top, level.rooms[level.rooms.length - 1].top + level.rooms[level.rooms.length - 1].height),
        };
        level.cells[coord.x][coord.y].type = CellType.StairsDown;
    }

    for (let i = 0; i < monsterAmount; i++) {
        const roomIndex = randomInt(1, level.rooms.length);
        const coord: Coord = {
            x: randomInt(level.rooms[roomIndex].left, level.rooms[roomIndex].left + level.rooms[roomIndex].width),
            y: randomInt(level.rooms[roomIndex].top, level.rooms[roomIndex].top + level.rooms[roomIndex].height),
        };

        const monster: Entity = {
            alpha: 1,
            char: "",
            class: Class.Warrior,
            color: "#ffffff",
            disposition: Disposition.Aggressive,
            factions: [],
            hostileEntityIds: [],
            hostileFactions: [],
            id: game.currentId++,
            inventory: [],
            level: 1,
            name: "",
            sight: 10,
            x: coord.x,
            y: coord.y,
        };

        const roll = randomFloat(0, 1);
        if (roll < 0.25) {
            monster.name = "rat";
            monster.char = "r";
            monster.factions = [
                Faction.Monster,
            ];
            monster.hostileFactions = [];
            monster.disposition = Disposition.Cowardly;
        } else if (roll < 0.50) {
            monster.name = "slime";
            monster.char = "s";
            monster.factions = [
                Faction.Monster,
            ];
            monster.disposition = Disposition.Passive;
        } else if (roll < 0.75) {
            monster.name = "orc";
            monster.char = "o";
            monster.factions = [
                Faction.Monster,
                Faction.Orc,
            ];
            monster.hostileFactions = [
                Faction.Player,
                Faction.Bugbear,
            ];
            if (randomFloat(0, 1) < 0.5) {
                monster.color = "#ffff00";
                monster.name += " shaman";
                monster.class = Class.Shaman;
            }
        } else {
            monster.name = "bugbear";
            monster.char = "b";
            monster.factions = [
                Faction.Monster,
                Faction.Bugbear,
            ];
            monster.hostileFactions = [
                Faction.Player,
                Faction.Orc,
            ];
            if (randomFloat(0, 1) < 0.5) {
                monster.color = "#ffff00";
                monster.name += " shaman";
                monster.class = Class.Shaman;
            }
        }

        level.entities.push(monster);
    }

    for (let i = 0; i < chestAmount; i++) {
        const roomIndex = randomInt(0, level.rooms.length);
        const coord: Coord = {
            x: randomInt(level.rooms[roomIndex].left, level.rooms[roomIndex].left + level.rooms[roomIndex].width),
            y: randomInt(level.rooms[roomIndex].top, level.rooms[roomIndex].top + level.rooms[roomIndex].height),
        };

        level.chests.push({
            alpha: 1,
            char: "~",
            color: "#ffffff",
            loot: (() => {
                if (randomFloat(0, 1) < 0.5) {
                    const item: Item = {
                        alpha: 1,
                        char: "",
                        color: "#ffffff",
                        equipped: false,
                        name: "",
                        x: -1, y: -1,
                    };

                    const roll = randomFloat(0, 1);
                    if (roll < 0.25) {
                        item.name = "sword";
                        item.char = "|";
                    } else if (roll < 0.50) {
                        item.name = "spear";
                        item.char = "/";
                    } else if (roll < 0.75) {
                        item.name = "shield";
                        item.char = ")";
                    } else {
                        item.name = "bow";
                        item.char = "}";
                    }

                    return item;
                }
            })(),
            x: coord.x,
            y: coord.y,
        });
    }

    return level;
}

export function createTown() {
    const town: Chunk = {
        cells: [],
        chests: [],
        dungeons: [],
        entities: [],
        height: 25,
        items: [],
        width: 25,
    };

    for (let x = 0; x < town.width; x++) {
        town.cells[x] = [];
        for (let y = 0; y < town.height; y++) {
            town.cells[x][y] = {
                discovered: false,
                type: CellType.Grass,
            };
        }
    }

    {
        const coord: Coord = {
            x: Math.round(town.width / 2),
            y: Math.round(town.height / 2),
        };

        town.cells[coord.x][coord.y].type = CellType.StairsDown;

        const player: Entity = {
            alpha: 1,
            char: "@",
            class: Class.Warrior,
            color: "#ffffff",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Player,
            ],
            hostileEntityIds: [],
            hostileFactions: [
                Faction.Monster,
            ],
            id: game.currentId++,
            inventory: [],
            level: 1,
            name: "player",
            sight: 5,
            x: coord.x,
            y: coord.y,
        };

        town.entities.push(player);
    }

    return town;
}
