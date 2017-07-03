/// <reference path="main.js" />

function createTown() {
    const town = {
        width: 25,
        height: 25,
        cells: [],
        rooms: [],
        entities: [],
        chests: [],
        items: []
    };

    for (let x = 0; x < town.width; x++) {
        town.cells[x] = [];
        for (let y = 0; y < town.height; y++) {
            town.cells[x][y] = {
                type: 'grass',
                discovered: false
            }
        }
    }

    const x = Math.round(town.width / 2);
    const y = Math.round(town.height / 2);
    town.cells[x][y].type = 'stairsDown';

    const player = {
        id: 0,
        x: x,
        y: y,
        name: 'player',
        char: '@',
        level: 0,
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
        factions: [
            'player'
        ],
        hostileFactions: [
            'monster'
        ],
        hostileEntities: []
    };
    town.entities.push(player);

    return town;
}

function createDungeon(width, height, roomAttempts, minRoomSize, maxRoomSize, preventOverlap, doorChance, trapAmount, monsterAmount, chestAmount) {
    const dungeon = {
        width: width,
        height: height,
        cells: [],
        rooms: [],
        entities: [],
        chests: [],
        items: []
    };

    for (let x = 0; x < dungeon.width; x++) {
        dungeon.cells[x] = [];
        for (let y = 0; y < dungeon.height; y++) {
            dungeon.cells[x][y] = {
                type: 'empty',
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
                    if (dungeon.cells[x][y].type === 'floor') {
                        return true;
                    }
                    if (dungeon.cells[x][y - 1].type === 'floor') {
                        return true;
                    }
                    if (dungeon.cells[x + 1][y].type === 'floor') {
                        return true;
                    }
                    if (dungeon.cells[x][y + 1].type === 'floor') {
                        return true;
                    }
                    if (dungeon.cells[x - 1][y].type === 'floor') {
                        return true;
                    }
                }
            }
        })()) {
            continue;
        }

        const room = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight
        }

        for (let x = room.x; x < room.x + room.width; x++) {
            for (let y = room.y; y < room.y + room.height; y++) {
                dungeon.cells[x][y].type = 'floor';
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
                    dungeon.cells[x][y].type = 'floor';
                }
            }
        }
    }

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            if (dungeon.cells[x][y].type === 'floor') {
                if (dungeon.cells[x][y - 1].type === 'empty') {
                    dungeon.cells[x][y - 1].type = 'wall';
                }
                if (dungeon.cells[x + 1][y - 1].type === 'empty') {
                    dungeon.cells[x + 1][y - 1].type = 'wall';
                }
                if (dungeon.cells[x + 1][y].type === 'empty') {
                    dungeon.cells[x + 1][y].type = 'wall';
                }
                if (dungeon.cells[x + 1][y + 1].type === 'empty') {
                    dungeon.cells[x + 1][y + 1].type = 'wall';
                }
                if (dungeon.cells[x][y + 1].type === 'empty') {
                    dungeon.cells[x][y + 1].type = 'wall';
                }
                if (dungeon.cells[x - 1][y - 1].type === 'empty') {
                    dungeon.cells[x - 1][y - 1].type = 'wall';
                }
                if (dungeon.cells[x - 1][y].type === 'empty') {
                    dungeon.cells[x - 1][y].type = 'wall';
                }
                if (dungeon.cells[x - 1][y + 1].type === 'empty') {
                    dungeon.cells[x - 1][y + 1].type = 'wall';
                }
            }
        }
    }

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            const roll = Math.random();
            if (roll < doorChance) {
                if (dungeon.cells[x][y].type === 'floor') {
                    if (dungeon.cells[x][y - 1].type === 'floor' && dungeon.cells[x + 1][y - 1].type === 'floor' && dungeon.cells[x - 1][y - 1].type === 'floor') {
                        if (dungeon.cells[x - 1][y].type === 'wall' && dungeon.cells[x + 1][y].type === 'wall') {
                            dungeon.cells[x][y].type = 'doorClosed';
                        }
                    }
                    if (dungeon.cells[x + 1][y].type === 'floor' && dungeon.cells[x + 1][y - 1].type === 'floor' && dungeon.cells[x + 1][y + 1].type === 'floor') {
                        if (dungeon.cells[x][y + 1].type === 'wall' && dungeon.cells[x][y - 1].type === 'wall') {
                            dungeon.cells[x][y].type = 'doorClosed';
                        }
                    }
                    if (dungeon.cells[x][y + 1].type === 'floor' && dungeon.cells[x + 1][y + 1].type === 'floor' && dungeon.cells[x - 1][y + 1].type === 'floor') {
                        if (dungeon.cells[x - 1][y].type === 'wall' && dungeon.cells[x + 1][y].type === 'wall') {
                            dungeon.cells[x][y].type = 'doorClosed';
                        }
                    }
                    if (dungeon.cells[x - 1][y].type === 'floor' && dungeon.cells[x - 1][y - 1].type === 'floor' && dungeon.cells[x - 1][y + 1].type === 'floor') {
                        if (dungeon.cells[x][y + 1].type === 'wall' && dungeon.cells[x][y - 1].type === 'wall') {
                            dungeon.cells[x][y].type = 'doorClosed';
                        }
                    }
                }
            }
        }
    }

    if (dungeon.rooms.length > 0) {
        for (let i = 0; i < trapAmount; i++) {
            const roomIndex = getRandomInt(0, dungeon.rooms.length);

            const x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            const y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

            dungeon.cells[x][y].type = 'trap';
        }
    }

    if (dungeon.rooms.length > 0) {
        const x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
        const y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);

        dungeon.cells[x][y].type = 'stairsUp';
    }

    if (dungeon.rooms.length > 0) {
        const x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
        const y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);

        dungeon.cells[x][y].type = 'stairsDown';
    }

    if (dungeon.rooms.length > 1) {
        for (let i = 0; i < monsterAmount; i++) {
            const roomIndex = getRandomInt(1, dungeon.rooms.length);

            const x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            const y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

            const monster = {
                id: game.id++,
                x: x,
                y: y,
                name: '',
                char: '',
                level: game.dungeons.length,
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
                hostileEntities: []
            };

            const roll = Math.random();
            if (roll < 0.25) {
                monster.name = 'rat';
                monster.char = 'r';
                monster.factions = [
                    'monster',
                    'rat'
                ];
                monster.hostileFactions = [
                    'player'
                ];
            } else if (roll < 0.50) {
                monster.name = 'slime';
                monster.char = 's';
                monster.factions = [
                    'monster',
                    'slime'
                ];
                monster.hostileFactions = [
                    'player'
                ];
            } else if (roll < 0.75) {
                monster.name = 'orc';
                monster.char = 'o';
                monster.factions = [
                    'monster',
                    'orc'
                ];
                monster.hostileFactions = [
                    'player',
                    'bugbear'
                ];
            } else {
                monster.name = 'bugbear';
                monster.char = 'b';
                monster.factions = [
                    'monster',
                    'bugbear'
                ];
                monster.hostileFactions = [
                    'player',
                    'orc'
                ];
            }

            dungeon.entities.push(monster);
        }
    }

    if (dungeon.rooms.length > 0) {
        for (let i = 0; i < chestAmount; i++) {
            const roomIndex = getRandomInt(0, dungeon.rooms.length);

            const x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            const y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);

            const chest = {
                x: x,
                y: y,
                loot: (() => {
                    const roll = Math.random();
                    if (roll < 0) {
                        return undefined;
                    } else {
                        const item = {
                            x: -1,
                            y: -1,
                            name: '',
                            char: '',
                            index: ''
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
                    }
                })()
            };

            dungeon.chests.push(chest);
        }
    }

    return dungeon;
}

function createDungeon_bspTree(width, height) {
    const dungeon = {
        width: width,
        height: height,
        cells: [],
        rooms: [],
        entities: [],
        chests: [],
        items: []
    };

    for (let x = 0; x < dungeon.width; x++) {
        dungeon.cells[x] = [];
        for (let y = 0; y < dungeon.height; y++) {
            dungeon.cells[x][y] = {
                type: 'empty',
                discovered: false
            }
        }
    }

    function Leaf(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.MIN_LEAF_SIZE = 10;
        this.child1 = undefined;
        this.child2 = undefined;
        this.room = undefined;
        this.hall = undefined;

        this.split = function () {
            if (this.child1 || this.child2) {
                return false;
            }

            splitHorizontally = Math.random() < 0.5;
            if (this.width / this.height >= 1.25) {
                splitHorizontally = false;
            } else if (this.height / this.width >= 1.25) {
                splitHorizontally = true;
            }

            let max;
            if (splitHorizontally) {
                max = this.height - this.MIN_LEAF_SIZE;
            } else {
                max = this.width - this.MIN_LEAF_SIZE;
            }

            if (max <= this.MIN_LEAF_SIZE) {
                return false;
            }

            let split = getRandomInt(this.MIN_LEAF_SIZE, max);

            if (splitHorizontally) {
                this.child1 = new Leaf(this.x, this.y, this.width, split);
                this.child2 = new Leaf(this.x, this.y + split, this.width, this.height - split);
            } else {
                this.child1 = new Leaf(this.x, this.y, split, this.height);
                this.child2 = new Leaf(this.x + split, this.y, this.width - split, this.height);
            }

            return true;
        }

        this.createRooms = function (bspTree) {
            if (this.child1 || this.child2) {
                if (this.child1) {
                    this.child1.createRooms(bspTree);
                }
                if (this.child2) {
                    this.child2.createRooms(bspTree);
                }

                if (this.child1 && this.child2) {
                    bspTree.createHall(this.child1.getRoom(), this.child2.getRoom());
                }
            } else {
                let w;
                let h;
                let x;
                let y;
                this.room = new Rect(x, y, w, h);
                bspTree.createRoom(this.room);
            }
        }

        this.getRoom = function () {

        }
    }

    const leafs = [];

    const rootLeaf = new Leaf(0, 0, width, height);
    leafs.push(rootLeaf);

    return dungeon;
}
