function createTown() {
    const town: Dungeon = {
        width: 25,
        height: 25,
        cells: [],
        rooms: [],
        litRooms: false,
        entities: [],
        chests: [],
        items: []
    };

    for (let x = 0; x < town.width; x++) {
        town.cells[x] = [];
        for (let y = 0; y < town.height; y++) {
            town.cells[x][y] = {
                type: CellType.Grass,
                discovered: false
            }
        }
    }

    town.rooms.push({
        x: 0,
        y: 0,
        width: town.width,
        height: town.height
    });

    const x = Math.round(town.width / 2);
    const y = Math.round(town.height / 2);
    town.cells[x][y].type = CellType.StairsDown;

    town.entities.push({
        x: x,
        y: y,
        char: '@',
        color: '#ffffff',
        alpha: 1,
        id: game.currentId++,
        name: 'player',
        class: Class.Warrior,
        stats: {
            level: 1,

            health: 100,
            energy: 100,
            mana: 100,

            stamina: 0,
            endurance: 0,
            attunement: 0,
            resistance: 0,
            strength: 0,
            intellect: 0,
            avoidance: 0,
            precision: 0,
            charisma: 0,
            luck: 0,

            sight: 5
        },
        inventory: [],
        factions: [
            Faction.Player
        ],
        hostileFactions: [
            Faction.Monster
        ],
        hostileEntityIds: [],
        disposition: Disposition.Aggressive
    });

    return town;
}

function createDungeon(width: number,
                       height: number,
                       roomAttempts: number,
                       minRoomSize: number,
                       maxRoomSize: number,
                       preventOverlap: boolean,
                       litRooms: boolean,
                       doorChance: number,
                       trapAmount: number,
                       monsterAmount: number,
                       chestAmount: number) {
    const dungeon: Dungeon = {
        width: width,
        height: height,
        cells: [],
        rooms: [],
        litRooms: litRooms,
        entities: [],
        chests: [],
        items: []
    };

    for (let x = 0; x < dungeon.width; x++) {
        dungeon.cells[x] = [];
        for (let y = 0; y < dungeon.height; y++) {
            dungeon.cells[x][y] = {
                type: CellType.Empty,
                discovered: false
            }
        }
    }

    for (let i = 0; i < roomAttempts; i++) {
        const roomX = getRandomInt(0, dungeon.width);
        const roomY = getRandomInt(0, dungeon.height);
        const roomWidth = getRandomInt(minRoomSize, maxRoomSize);
        const roomHeight = getRandomInt(minRoomSize, maxRoomSize);

        if (roomX < 1 || roomX + roomWidth > dungeon.width - 1 || roomY < 1 || roomY + roomHeight > dungeon.height - 1) {
            continue;
        }

        if (preventOverlap && (() => {
            for (let x = roomX; x < roomX + roomWidth; x++) {
                for (let y = roomY; y < roomY + roomHeight; y++) {
                    if (dungeon.cells[x][y].type === CellType.Floor) {
                        return true;
                    }
                    if (dungeon.cells[x][y - 1].type === CellType.Floor) {
                        return true;
                    }
                    if (dungeon.cells[x + 1][y].type === CellType.Floor) {
                        return true;
                    }
                    if (dungeon.cells[x][y + 1].type === CellType.Floor) {
                        return true;
                    }
                    if (dungeon.cells[x - 1][y].type === CellType.Floor) {
                        return true;
                    }
                }
            }
        })()) {
            continue;
        }

        const room: Rect = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight
        }

        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                dungeon.cells[x][y].type = CellType.Floor;
            }
        }

        dungeon.rooms.push(room);
    }

    for (let i = 0; i < dungeon.rooms.length - 1; i++) {
        let x1 = getRandomInt(dungeon.rooms[i].x, dungeon.rooms[i].x + dungeon.rooms[i].width);
        let y1 = getRandomInt(dungeon.rooms[i].y, dungeon.rooms[i].y + dungeon.rooms[i].height);
        let x2 = getRandomInt(dungeon.rooms[i + 1].x, dungeon.rooms[i + 1].x + dungeon.rooms[i + 1].width);
        let y2 = getRandomInt(dungeon.rooms[i + 1].y, dungeon.rooms[i + 1].y + dungeon.rooms[i + 1].height);

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
                    dungeon.cells[x][y].type = CellType.Floor;
                }
            }
        }
    }

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            if (dungeon.cells[x][y].type !== CellType.Floor) {
                continue;
            }

            if (dungeon.cells[x][y - 1].type === CellType.Empty) {
                dungeon.cells[x][y - 1].type = CellType.Wall;
            }
            if (dungeon.cells[x + 1][y - 1].type === CellType.Empty) {
                dungeon.cells[x + 1][y - 1].type = CellType.Wall;
            }
            if (dungeon.cells[x + 1][y].type === CellType.Empty) {
                dungeon.cells[x + 1][y].type = CellType.Wall;
            }
            if (dungeon.cells[x + 1][y + 1].type === CellType.Empty) {
                dungeon.cells[x + 1][y + 1].type = CellType.Wall;
            }
            if (dungeon.cells[x][y + 1].type === CellType.Empty) {
                dungeon.cells[x][y + 1].type = CellType.Wall;
            }
            if (dungeon.cells[x - 1][y - 1].type === CellType.Empty) {
                dungeon.cells[x - 1][y - 1].type = CellType.Wall;
            }
            if (dungeon.cells[x - 1][y].type === CellType.Empty) {
                dungeon.cells[x - 1][y].type = CellType.Wall;
            }
            if (dungeon.cells[x - 1][y + 1].type === CellType.Empty) {
                dungeon.cells[x - 1][y + 1].type = CellType.Wall;
            }
        }
    }

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            if (Math.random() < doorChance) {
                continue;
            }

            if (dungeon.cells[x][y].type !== CellType.Floor) {
                continue;
            }

            if (dungeon.cells[x][y - 1].type === CellType.Floor && dungeon.cells[x + 1][y - 1].type === CellType.Floor && dungeon.cells[x - 1][y - 1].type === CellType.Floor) {
                if (dungeon.cells[x - 1][y].type === CellType.Wall && dungeon.cells[x + 1][y].type === CellType.Wall) {
                    dungeon.cells[x][y].type = CellType.DoorClosed;
                }
            }
            if (dungeon.cells[x + 1][y].type === CellType.Floor && dungeon.cells[x + 1][y - 1].type === CellType.Floor && dungeon.cells[x + 1][y + 1].type === CellType.Floor) {
                if (dungeon.cells[x][y + 1].type === CellType.Wall && dungeon.cells[x][y - 1].type === CellType.Wall) {
                    dungeon.cells[x][y].type = CellType.DoorClosed;
                }
            }
            if (dungeon.cells[x][y + 1].type === CellType.Floor && dungeon.cells[x + 1][y + 1].type === CellType.Floor && dungeon.cells[x - 1][y + 1].type === CellType.Floor) {
                if (dungeon.cells[x - 1][y].type === CellType.Wall && dungeon.cells[x + 1][y].type === CellType.Wall) {
                    dungeon.cells[x][y].type = CellType.DoorClosed;
                }
            }
            if (dungeon.cells[x - 1][y].type === CellType.Floor && dungeon.cells[x - 1][y - 1].type === CellType.Floor && dungeon.cells[x - 1][y + 1].type === CellType.Floor) {
                if (dungeon.cells[x][y + 1].type === CellType.Wall && dungeon.cells[x][y - 1].type === CellType.Wall) {
                    dungeon.cells[x][y].type = CellType.DoorClosed;
                }
            }
        }
    }

    {
        const x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
        const y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);
        dungeon.cells[x][y].type = CellType.StairsUp;
    }

    {
        const x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
        const y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);
        dungeon.cells[x][y].type = CellType.StairsDown;
    }

    for (let i = 0; i < monsterAmount; i++) {
        const roomIndex = getRandomInt(1, dungeon.rooms.length);

        const x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
        const y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

        const monster: Entity = {
            x: x,
            y: y,
            char: '',
            color: '#ffffff',
            alpha: 1,
            id: game.currentId++,
            name: '',
            class: Class.Warrior,
            stats: {
                level: 1,

                health: 100,
                energy: 100,
                mana: 100,

                stamina: 0,
                endurance: 0,
                attunement: 0,
                resistance: 0,
                strength: 0,
                intellect: 0,
                avoidance: 0,
                precision: 0,
                charisma: 0,
                luck: 0,

                sight: 10
            },
            inventory: [],
            factions: [],
            hostileFactions: [],
            hostileEntityIds: [],
            disposition: Disposition.Aggressive
        };

        const roll = Math.random();
        if (roll < 0.25) {
            monster.name = 'rat';
            monster.char = 'r';
            monster.factions = [
                Faction.Monster
            ];
            monster.hostileFactions = [];
            monster.disposition = Disposition.Cowardly;
        } else if (roll < 0.50) {
            monster.name = 'slime';
            monster.char = 's';
            monster.factions = [
                Faction.Monster
            ];
            monster.disposition = Disposition.Passive;
        } else if (roll < 0.75) {
            monster.name = 'orc';
            monster.char = 'o';
            monster.factions = [
                Faction.Monster,
                Faction.Orc
            ];
            monster.hostileFactions = [
                Faction.Player,
                Faction.Bugbear
            ];
            if (Math.random() < 0.5) {
                monster.color = '#ffff00';
                monster.name += ' shaman';
                monster.class = Class.Shaman;
            }
        } else {
            monster.name = 'bugbear';
            monster.char = 'b';
            monster.factions = [
                Faction.Monster,
                Faction.Bugbear
            ];
            monster.hostileFactions = [
                Faction.Player,
                Faction.Orc
            ];
            if (Math.random() < 0.5) {
                monster.color = '#ffff00';
                monster.name += ' shaman';
                monster.class = Class.Shaman;
            }
        }

        dungeon.entities.push(monster);
    }

    for (let i = 0; i < chestAmount; i++) {
        const roomIndex = getRandomInt(0, dungeon.rooms.length);

        const x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
        const y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

        const chest: Chest = {
            x: x,
            y: y,
            char: '~',
            color: '#ffffff',
            alpha: 1,
            loot: (() => {
                if (Math.random() < 0.5) {
                    return undefined;
                }

                const item: Item = {
                    x: -1,
                    y: -1,
                    char: '',
                    color: '#ffffff',
                    alpha: 1,
                    name: '',
                    equipped: false
                }
                const roll = Math.random();
                if (roll < 0.25) {
                    item.name = 'sword';
                    item.char = '|';
                } else if (roll < 0.50) {
                    item.name = 'spear';
                    item.char = '/';
                } else if (roll < 0.75) {
                    item.name = 'shield';
                    item.char = ')';
                } else {
                    item.name = 'bow';
                    item.char = '}';
                }
                
                return item;
            })()
        };

        dungeon.chests.push(chest);
    }

    return dungeon;
}
