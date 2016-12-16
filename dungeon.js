/*
TODO
    
*/

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = {
    player: {
        sight: 10,
        inventory: []
    },
    dungeons: [],
    turn: 0,
    level: 0,
    characterSize: 12,
    drawMode: "game"
}
var view = {
    x: 0,
    y: 0,
    width: Math.round(canvas.width / game.characterSize),
    height: Math.round(canvas.height / game.characterSize)
}
var inventorySelection = 0;
changeLevel(0);
document.addEventListener("keydown", onKeyDown);

function changeLevel(level) {
    game.level = level
    if (game.level == game.dungeons.length) {
        createDungeon(50, 50, 20, 5, 15, true, 0.5, 3, 10, 5);
    }
    centerView(getCurrentDungeon().player.x, getCurrentDungeon().player.y);
    draw();
    console.log("welcome to level " + (game.level + 1));
}

function createDungeon(width, height, roomAttempts, minRoomSize, maxRoomSize, preventOverlap, doorChance, trapAmount, creatureAmount, chestAmount) {
    // dungeon
    var dungeon = {
        width: width,
        height: height,
        cells: [],
        rooms: [],
        player: {
            x: 0,
            y: 0
        },
        creatures: [],
        corpses: [],
        chests: []
    }
    // cells
    for (var x = 0; x < dungeon.width; x++) {
        dungeon.cells[x] = [];
        for (var y = 0; y < dungeon.height; y++) {
            dungeon.cells[x][y] = {
                type: "empty",
                discovered: false,
                visible: false
            }
        }
    }
    // rooms
    for (var i = 0; i < roomAttempts; i++) {
        var roomX = getRandomInt(0, dungeon.width);
        var roomY = getRandomInt(0, dungeon.height);
        var roomWidth = getRandomInt(minRoomSize, maxRoomSize);
        var roomHeight = getRandomInt(minRoomSize, maxRoomSize);
        // check bounds
        if (roomX < 1 || roomX + roomWidth > dungeon.width - 1 || roomY < 1 || roomY + roomHeight > dungeon.height - 1) {
            continue;
        }
        // check overlap
        if (preventOverlap) {
            var overlap = false;
            for (var x = roomX; x < roomX + roomWidth; x++) {
                for (var y = roomY; y < roomY + roomHeight; y++) {
                    if (dungeon.cells[x][y].type == "floor") {
                        overlap = true;
                    }
                    if (dungeon.cells[x][y - 1].type == "floor") {
                        overlap = true;
                    }
                    if (dungeon.cells[x + 1][y].type == "floor") {
                        overlap = true;
                    }
                    if (dungeon.cells[x][y + 1].type == "floor") {
                        overlap = true;
                    }
                    if (dungeon.cells[x - 1][y].type == "floor") {
                        overlap = true;
                    }
                }
            }
            if (overlap) {
                continue;
            }
        }
        // create a room
        var room = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight
        }
        // assign cells
        for (var x = room.x; x < room.x + room.width; x++) {
            for (var y = room.y; y < room.y + room.height; y++) {
                dungeon.cells[x][y].type = "floor";
            }
        }
        // add to the list
        dungeon.rooms.push(room);
    }
    // connect rooms
    for (var i = 0; i < dungeon.rooms.length - 1; i++) {
        var x1 = getRandomInt(dungeon.rooms[i].x, dungeon.rooms[i].x + dungeon.rooms[i].width);
        var y1 = getRandomInt(dungeon.rooms[i].y, dungeon.rooms[i].y + dungeon.rooms[i].height);
        var x2 = getRandomInt(dungeon.rooms[i + 1].x, dungeon.rooms[i + 1].x + dungeon.rooms[i + 1].width);
        var y2 = getRandomInt(dungeon.rooms[i + 1].y, dungeon.rooms[i + 1].y + dungeon.rooms[i + 1].height);
        if (x1 > x2) {
            var t = x1;
            x1 = x2;
            x2 = t;
        }
        if (y1 > y2) {
            var t = y1;
            y1 = y2;
            y2 = t;
        }
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                if (x == x1 || x == x2 || y == y1 || y == y2) {
                    dungeon.cells[x][y].type = "floor";
                }
            }
        }
    }
    // walls
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            if (dungeon.cells[x][y].type == "floor") {
                if (dungeon.cells[x][y - 1].type == "empty") {
                    dungeon.cells[x][y - 1].type = "wall";
                }
                if (dungeon.cells[x + 1][y].type == "empty") {
                    dungeon.cells[x + 1][y].type = "wall";
                }
                if (dungeon.cells[x][y + 1].type == "empty") {
                    dungeon.cells[x][y + 1].type = "wall";
                }
                if (dungeon.cells[x - 1][y].type == "empty") {
                    dungeon.cells[x - 1][y].type = "wall";
                }
            }
        }
    }
    // doors
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            var roll = Math.random();
            if (roll < doorChance) {
                if (dungeon.cells[x][y].type == "floor") {
                    if (dungeon.cells[x][y - 1].type == "floor" && dungeon.cells[x + 1][y - 1].type == "floor" && dungeon.cells[x - 1][y - 1].type == "floor") {
                        if (dungeon.cells[x - 1][y].type == "wall" && dungeon.cells[x + 1][y].type == "wall") {
                            dungeon.cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeon.cells[x + 1][y].type == "floor" && dungeon.cells[x + 1][y - 1].type == "floor" && dungeon.cells[x + 1][y + 1].type == "floor") {
                        if (dungeon.cells[x][y + 1].type == "wall" && dungeon.cells[x][y - 1].type == "wall") {
                            dungeon.cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeon.cells[x][y + 1].type == "floor" && dungeon.cells[x + 1][y + 1].type == "floor" && dungeon.cells[x - 1][y + 1].type == "floor") {
                        if (dungeon.cells[x - 1][y].type == "wall" && dungeon.cells[x + 1][y].type == "wall") {
                            dungeon.cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeon.cells[x - 1][y].type == "floor" && dungeon.cells[x - 1][y - 1].type == "floor" && dungeon.cells[x - 1][y + 1].type == "floor") {
                        if (dungeon.cells[x][y + 1].type == "wall" && dungeon.cells[x][y - 1].type == "wall") {
                            dungeon.cells[x][y].type = "doorClosed";
                        }
                    }
                }
            }
        }
    }
    // traps
    if (dungeon.rooms.length > 0) {
        for (var i = 0; i < trapAmount; i++) {
            var roomIndex = getRandomInt(0, dungeon.rooms.length);
            var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
            dungeon.cells[x][y].type = "trap";
        }
    }
    // stairs up
    if (dungeon.rooms.length > 0) {
        var x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
        var y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);
        dungeon.cells[x][y].type = "stairsUp";
    }
    // stairs down
    if (dungeon.rooms.length > 0) {
        var x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
        var y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);
        dungeon.cells[x][y].type = "stairsDown";
    }
    // move player
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            if (dungeon.cells[x][y].type == "stairsUp") {
                dungeon.player.x = x;
                dungeon.player.y = y;
                break;
            }
        }
    }
    // creatures
    if (dungeon.rooms.length > 1) {
        for (var i = 0; i < creatureAmount; i++) {
            var roomIndex = getRandomInt(1, dungeon.rooms.length);
            var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
            var creature = {
                x: x,
                y: y,
                name: "",
                char: "",
                dungeon: game.level,
            }
            var roll = Math.random();
            if (roll < 0.3) {
                creature.name = "rat";
                creature.char = "r";
            } else if (roll < 0.6) {
                creature.name = "slime";
                creature.char = "s";
            } else {
                creature.name = "orc";
                creature.char = "o";
            }
            dungeon.creatures.push(creature);
        }
    }
    // chests
    if (dungeon.rooms.length > 0) {
        for (var i = 0; i < chestAmount; i++) {
            var roomIndex = getRandomInt(0, dungeon.rooms.length);
            var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
            var chest = {
                x: x,
                y: y,
                loot: null
            }
            var roll = Math.random();
            if (roll < 0.5) {
                chest.loot = null;
            }
            else {
                var loot = {
                    name: ""
                }
                var roll = Math.random();
                if (roll < 0.3) {
                    loot.name = "sword";
                } else if (roll < 0.6) {
                    loot.name = "spear";
                } else {
                    loot.name = "shield";
                }
                chest.loot = loot;
            }
            dungeon.chests.push(chest);
        }
    }
    // add to list
    game.dungeons.push(dungeon);
}

function onKeyDown(e) {
    switch (game.drawMode) {
        case "game":
            if (e.key == "ArrowUp") {
                movePlayer(getCurrentDungeon().player.x, getCurrentDungeon().player.y - 1);
            }
            if (e.key == "ArrowRight") {
                movePlayer(getCurrentDungeon().player.x + 1, getCurrentDungeon().player.y);
            }
            if (e.key == "ArrowDown") {
                movePlayer(getCurrentDungeon().player.x, getCurrentDungeon().player.y + 1);
            }
            if (e.key == "ArrowLeft") {
                movePlayer(getCurrentDungeon().player.x - 1, getCurrentDungeon().player.y);
            }
            break;
        case "inventory":
            if (e.key == "ArrowUp") {
                inventorySelection--;
            }
            if (e.key == "ArrowDown") {
                inventorySelection++;
            }
            if (e.key == "z") {
                useItem(game.player.inventory[inventorySelection]);
            }
            break;
    }
    if (e.key == "Escape") {
        game.drawMode = "game";
        draw();
    }
    if (e.key == "i") {
        if (game.drawMode == "inventory") {
            game.drawMode = "game";
        }
        else {
            game.drawMode = "inventory";
        }
        draw();
    }
    if (e.key == "1") {
        localStorage.setItem("game", JSON.stringify(game));
        console.log("game saved");
    }
    if (e.key == "2") {
        game = JSON.parse(localStorage.getItem("game"));
        console.log("game loaded");
        changeLevel(game.level);
    }
    draw();
}

function movePlayer(x, y) {
    var move = true;
    var ascend = false;
    var descend = false;
    if (x >= 0 && x < getCurrentDungeon().width && y >= 0 && y < getCurrentDungeon().height) {
        switch (getCurrentDungeon().cells[x][y].type) {
            case "wall":
                move = false;
                break;
            case "doorClosed":
                move = false;
                var roll = Math.random();
                if (roll > 0.5) {
                    console.log("you open the door");
                    getCurrentDungeon().cells[x][y].type = "doorOpen";
                }
                else {
                    console.log("the door won't budge");
                }
                break;
            case "trap":
                console.log("you triggered a trap!");
                getCurrentDungeon().cells[x][y].type = "floor";
                break;
            case "stairsUp":
                if (game.level == 0) {
                    document.location.reload();
                }
                else {
                    console.log("you ascend");
                    ascend = true;
                }
                break;
            case "stairsDown":
                console.log("you descend");
                descend = true;
                break;
        }
        for (var i = 0; i < getCurrentDungeon().creatures.length; i++) {
            if (x == getCurrentDungeon().creatures[i].x && y == getCurrentDungeon().creatures[i].y) {
                move = false;
                var roll = Math.random();
                if (roll < 0.5) {
                    console.log("you miss the " + getCurrentDungeon().creatures[i].name);
                }
                else {
                    console.log("you kill the " + getCurrentDungeon().creatures[i].name);
                    var corpse = {
                        x: x,
                        y: y
                    }
                    getCurrentDungeon().corpses.push(corpse);
                    getCurrentDungeon().creatures.splice(i, 1);
                }
            }
        }
        for (var i = 0; i < getCurrentDungeon().chests.length; i++) {
            if (x == getCurrentDungeon().chests[i].x && y == getCurrentDungeon().chests[i].y) {
                move = false;
                var roll = Math.random();
                if (roll > 0.5) {
                    console.log("you open the chest");
                    var loot = getCurrentDungeon().chests[i].loot;
                    if (loot == null) {
                        console.log("there is nothing inside");
                    }
                    else {
                        game.player.inventory.push(loot);
                        console.log("you loot a " + loot.name);
                    }
                    getCurrentDungeon().chests.splice(i, 1);
                }
                else {
                    console.log("the chest won't open");
                }
            }
        }
    }
    else {
        move = false;
    }
    if (move) {
        getCurrentDungeon().player.x = x;
        getCurrentDungeon().player.y = y;
        centerView(x, y);
    }
    if (ascend) {
        changeLevel(game.level - 1);
    }
    if (descend) {
        changeLevel(game.level + 1);
    }
    tick();
}

function useItem(item) {
    removeItem(item);
}

function removeItem(item) {
    console.log("you destroy a " + item.name);
    game.player.inventory.splice(game.player.inventory.indexOf(item), 1);
}

function tick() {
    for (var i = 0; i < getCurrentDungeon().creatures.length; i++) {
        tickCreature(getCurrentDungeon().creatures[i]);
    }
    game.turn++;
    draw();
}

function tickCreature(creature) {
    var attackPlayer = false;
    if (getCreatureDungeon(creature) == getCurrentDungeon()) {
        if (creature.x == getCreatureDungeon(creature).player.x && creature.y - 1 == getCreatureDungeon(creature).player.y) {
            attackPlayer = true;
            moveCreature(creature, creature.x, creature.y - 1);
        } else if (creature.x + 1 == getCreatureDungeon(creature).player.x && creature.y == getCreatureDungeon(creature).player.y) {
            attackPlayer = true;
            moveCreature(creature, creature.x + 1, creature.y);
        } else if (creature.x == getCreatureDungeon(creature).player.x && creature.y + 1 == getCreatureDungeon(creature).player.y) {
            attackPlayer = true;
            moveCreature(creature, creature.x, creature.y + 1);
        } else if (creature.x == getCreatureDungeon(creature).player.x && creature.y + 1 == getCreatureDungeon(creature).player.y) {
            attackPlayer = true;
            moveCreature(creature, creature.x - 1, creature.y);
        }
    }
    if (!attackPlayer) {
        var roll = Math.random();
        if (roll < 0.25) {
            moveCreature(creature, creature.x, creature.y - 1);
        } else if (roll < 0.5) {
            moveCreature(creature, creature.x + 1, creature.y);
        } else if (roll < 0.75) {
            moveCreature(creature, creature.x, creature.y + 1);
        } else {
            moveCreature(creature, creature.x - 1, creature.y);
        }
    }
}

function moveCreature(creature, x, y) {
    var move = true;
    if (x >= 0 && x < getCreatureDungeon(creature).width && y >= 0 && y < getCreatureDungeon(creature).height) {
        switch (getCreatureDungeon(creature).cells[x][y].type) {
            case "wall":
                move = false;
                break;
            case "doorClosed":
                move = false;
                break;
            case "stairsUp":
                move = false;
                break;
            case "stairsDown":
                move = false;
                break;
        }
        if (getCreatureDungeon(creature) == getCurrentDungeon()) {
            if (x == getCreatureDungeon(creature).player.x && y == getCreatureDungeon(creature).player.y) {
                move = false;
                var roll = Math.random();
                if (roll < 0.5) {
                    console.log("the " + creature.name + " misses you");
                }
                else {
                    console.log("the " + creature.name + " attacks you");
                }
            }
        }
        for (var i = 0; i < getCreatureDungeon(creature).creatures.length; i++) {
            if (getCreatureDungeon(creature).creatures[i] == creature) {
                continue;
            }
            if (x == getCreatureDungeon(creature).creatures[i].x && y == getCreatureDungeon(creature).creatures[i].y) {
                move = false;
            }
        }
        for (var i = 0; i < getCreatureDungeon(creature).chests.length; i++) {
            if (x == getCreatureDungeon(creature).chests[i].x && y == getCreatureDungeon(creature).chests[i].y) {
                move = false;
            }
        }
    }
    else {
        move = false;
    }
    if (move) {
        creature.x = x;
        creature.y = y;
    }
}

function centerView(x, y) {
    view.x = x - Math.round(view.width / 2);
    view.y = y - Math.round(view.height / 2);
    if (view.x < 0) {
        view.x = 0;
    }
    if (view.x + view.width > getCurrentDungeon().width) {
        view.x = getCurrentDungeon().width - view.width;
    }
    if (view.y < 0) {
        view.y = 0;
    }
    if (view.y + view.height > getCurrentDungeon().height) {
        view.y = getCurrentDungeon().height - view.height;
    }
}

function calcFov() {
    for (var x = 0; x < getCurrentDungeon().width; x++) {
        for (var y = 0; y < getCurrentDungeon().height; y++) {
            getCurrentDungeon().cells[x][y].visible = false;
        }
    }
    for (var i = 0; i < 360; i++) {
        var dx = Math.cos(i * (Math.PI / 180));
        var dy = Math.sin(i * (Math.PI / 180));
        doFov(dx, dy);
    }
}

function doFov(dx, dy) {
    var ox = getCurrentDungeon().player.x + 0.5;
    var oy = getCurrentDungeon().player.y + 0.5;
    for (var i = 0; i < game.player.sight; i++) {
        var x = Math.trunc(ox);
        var y = Math.trunc(oy);
        if (x < 0 || x >= getCurrentDungeon().width || y < 0 || y >= getCurrentDungeon().height) {
            return;
        }
        getCurrentDungeon().cells[x][y].discovered = true;
        getCurrentDungeon().cells[x][y].visible = true;
        switch (getCurrentDungeon().cells[x][y].type) {
            case "empty":
                return;
            case "wall":
                return;
            case "doorClosed":
                return;
        }
        ox += dx;
        oy += dy;
    }
}

function draw() {
    calcFov();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var x = view.x; x < view.x + view.width; x++) {
        for (var y = view.y; y < view.y + view.height; y++) {
            if (x < 0 || x >= getCurrentDungeon().width || y < 0 || y >= getCurrentDungeon().height) {
                continue;
            }
            ctx.font = game.characterSize + "px Lucida Console";
            ctx.fillStyle = "#fff";
            if (x == getCurrentDungeon().player.x && y == getCurrentDungeon().player.y) {
                ctx.fillText("@", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                continue;
            }
            if (getCurrentDungeon().cells[x][y].visible) {
                var creature = false;
                for (var i = 0; i < getCurrentDungeon().creatures.length; i++) {
                    if (x == getCurrentDungeon().creatures[i].x && y == getCurrentDungeon().creatures[i].y) {
                        ctx.fillText(getCurrentDungeon().creatures[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                        creature = true;
                    }
                }
                if (creature) {
                    continue;
                }
                var corpse = false;
                for (var i = 0; i < getCurrentDungeon().corpses.length; i++) {
                    if (x == getCurrentDungeon().corpses[i].x && y == getCurrentDungeon().corpses[i].y) {
                        ctx.fillText("%", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                        corpse = true;
                    }
                }
                if (corpse) {
                    continue;
                }
                var chest = false;
                for (var i = 0; i < getCurrentDungeon().chests.length; i++) {
                    if (x == getCurrentDungeon().chests[i].x && y == getCurrentDungeon().chests[i].y) {
                        ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                        chest = true;
                    }
                }
                if (chest) {
                    continue;
                }
            }
            if (getCurrentDungeon().cells[x][y].visible) {
                ctx.fillStyle = "#fff";
            } else if (getCurrentDungeon().cells[x][y].discovered) {
                ctx.fillStyle = "#646464";
            } else {
                ctx.fillStyle = "#000";
            }
            switch (getCurrentDungeon().cells[x][y].type) {
                case "empty":
                    ctx.fillText(" ", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "floor":
                    ctx.fillText(".", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "wall":
                    ctx.fillText("#", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "doorClosed":
                    ctx.fillText("+", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "doorOpen":
                    ctx.fillText("-", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "stairsUp":
                    ctx.fillText("<", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "stairsDown":
                    ctx.fillText(">", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
                case "trap":
                    ctx.fillText("^", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    break;
            }
        }
    }
    switch (game.drawMode) {
        case "inventory":
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, 150, canvas.height);
            ctx.stroke();
            for (var i = 0; i < game.player.inventory.length; i++) {
                if (i == inventorySelection) {
                    ctx.fillStyle = "#ff0000";
                }
                else {
                    ctx.fillStyle = "#000";
                }
                ctx.fillText(game.player.inventory[i].name, 0, (i + 1) * 12);
            }
            break;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getCurrentDungeon() {
    return game.dungeons[game.level];
}

function getCreatureDungeon(creature) {
    return game.dungeons[creature.dungeon];
}