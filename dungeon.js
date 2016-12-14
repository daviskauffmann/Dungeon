/*
TODO
    calculate stuff in other dungeons
    line of sight
    font size
*/

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = {
    player: {
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

function changeLevel(level) {
    game.level = level
    if (game.level == game.dungeons.length) {
        createDungeon();
    }
    centerView(game.dungeons[game.level].playerX, game.dungeons[game.level].playerY);
    draw();
    console.log("welcome to level " + (game.level + 1));
}

function createDungeon() {
    // dungeon
    var dungeon = {
        width: 50,
        height: 50,
        cells: [],
        rooms: [],
        playerX: 0,
        playerY: 0,
        creatures: [],
        corpses: [],
        chests: []
    }
    // cells
    for (var x = 0; x < dungeon.width; x++) {
        dungeon.cells[x] = [];
        for (var y = 0; y < dungeon.height; y++) {
            dungeon.cells[x][y] = {
                type: "empty"
            }
        }
    }
    // rooms
    for (var i = 0; i < 20; i++) {
        var roomX = getRandomInt(0, dungeon.width);
        var roomY = getRandomInt(0, dungeon.height);
        var roomWidth = getRandomInt(5, 15);
        var roomHeight = getRandomInt(5, 15);
        // check bounds
        if (roomX < 1 || roomX + roomWidth > dungeon.width - 1 || roomY < 1 || roomY + roomHeight > dungeon.height - 1) {
            continue;
        }
        // check overlap
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
            if (Math.random() < 0.5) {
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
    // stairs
    if (dungeon.rooms.length > 0) {
        var x = getRandomInt(dungeon.rooms[0].x, dungeon.rooms[0].x + dungeon.rooms[0].width);
        var y = getRandomInt(dungeon.rooms[0].y, dungeon.rooms[0].y + dungeon.rooms[0].height);
        dungeon.cells[x][y].type = "stairsUp";
        var x = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].x, dungeon.rooms[dungeon.rooms.length - 1].x + dungeon.rooms[dungeon.rooms.length - 1].width);
        var y = getRandomInt(dungeon.rooms[dungeon.rooms.length - 1].y, dungeon.rooms[dungeon.rooms.length - 1].y + dungeon.rooms[dungeon.rooms.length - 1].height);
        dungeon.cells[x][y].type = "stairsDown";
    }
    // move player
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            if (dungeon.cells[x][y].type == "stairsUp") {
                dungeon.playerX = x;
                dungeon.playerY = y;
                break;
            }
        }
    }
    // creatures
    for (var i = 0; i < 20; i++) {
        if (dungeon.rooms.length > 1) {
            var roomIndex = getRandomInt(1, dungeon.rooms.length);
            var x = getRandomInt(dungeon.rooms[roomIndex].x, dungeon.rooms[roomIndex].x + dungeon.rooms[roomIndex].width);
            var y = getRandomInt(dungeon.rooms[roomIndex].y, dungeon.rooms[roomIndex].y + dungeon.rooms[roomIndex].height);
            var creature;
            var roll = Math.random();
            if (roll < 0.3) {
                creature = {
                    x: x,
                    y: y,
                    name: "rat",
                    char: "r"
                }
            } else if (roll < 0.6) {
                creature = {
                    x: x,
                    y: y,
                    name: "slime",
                    char: "s"
                }
            } else {
                creature = {
                    x: x,
                    y: y,
                    name: "orc",
                    char: "o"
                }
            }
            dungeon.creatures.push(creature);
        }
    }
    // chests
    for (var i = 0; i < 5; i++) {
        if (dungeon.rooms.length > 0) {
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
                var loot;
                var roll = Math.random();
                if (roll < 0.3){
                    loot = {
                        name: "sword"
                    }
                } else if (roll < 0.6){
                    loot = {
                        name: "spear"
                    }
                } else{
                    loot = {
                        name: "shield"
                    }
                }
                chest.loot = loot;
            }
            dungeon.chests.push(chest);
        }
    }
    // add to list
    game.dungeons.push(dungeon);
}

function tick() {
    for (var i = 0; i < game.dungeons[game.level].creatures.length; i++) {
        tickCreature(game.dungeons[game.level].creatures[i]);
    }
    game.turn++;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var x = view.x; x < view.x + view.width; x++) {
        for (var y = view.y; y < view.y + view.height; y++) {
            if (x < 0 || x >= game.dungeons[game.level].width || y < 0 || y >= game.dungeons[game.level].height) {
                continue;
            }
            ctx.fillStyle = "#fff";
            ctx.font = this.characterSize + "px Lucida Console";
            if (x == game.dungeons[game.level].playerX && y == game.dungeons[game.level].playerY) {
                ctx.fillText("@", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                continue;
            }
            var creature = false;
            for (var i = 0; i < game.dungeons[game.level].creatures.length; i++) {
                if (x == game.dungeons[game.level].creatures[i].x && y == game.dungeons[game.level].creatures[i].y) {
                    ctx.fillText(game.dungeons[game.level].creatures[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    creature = true;
                }
            }
            if (creature) {
                continue;
            }
            var corpse = false;
            for (var i = 0; i < game.dungeons[game.level].corpses.length; i++) {
                if (x == game.dungeons[game.level].corpses[i].x && y == game.dungeons[game.level].corpses[i].y) {
                    ctx.fillText("%", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    corpse = true;
                }
            }
            if (corpse) {
                continue;
            }
            var chest = false;
            for (var i = 0; i < game.dungeons[game.level].chests.length; i++) {
                if (x == game.dungeons[game.level].chests[i].x && y == game.dungeons[game.level].chests[i].y) {
                    ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                    chest = true;
                }
            }
            if (chest) {
                continue;
            }
            switch (game.dungeons[game.level].cells[x][y].type) {
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
            }
        }
    }
    switch (game.drawMode) {
        case "inventory":
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, 150, canvas.height);
            ctx.stroke();
            ctx.fillStyle = "#000";
            for (var i = 0; i < game.player.inventory.length; i++) {
                ctx.fillText(game.player.inventory[i].name, 0, (i + 1) * 12);
            }
            break;
    }
}

function movePlayer(x, y) {
    var move = true;
    var ascend = false;
    var descend = false;
    if (x >= 0 && x < game.dungeons[game.level].width && y >= 0 && y < game.dungeons[game.level].height) {
        if (game.dungeons[game.level].cells[x][y].type == "wall") {
            move = false;
        }
        if (game.dungeons[game.level].cells[x][y].type == "doorClosed") {
            move = false;
            var roll = Math.random();
            if (roll > 0.5) {
                console.log("you open the door");
                game.dungeons[game.level].cells[x][y].type = "doorOpen";
            }
            else {
                console.log("the door won't budge");
            }
        }
        if (game.dungeons[game.level].cells[x][y].type == "stairsUp") {
            if (game.level == 0) {
                document.location.reload();
            }
            else {
                console.log("you ascend");
                ascend = true;
            }
        }
        if (game.dungeons[game.level].cells[x][y].type == "stairsDown") {
            console.log("you descend");
            descend = true;
        }
        for (var i = 0; i < game.dungeons[game.level].creatures.length; i++) {
            if (x == game.dungeons[game.level].creatures[i].x && y == game.dungeons[game.level].creatures[i].y) {
                move = false;
                var roll = Math.random();
                if (roll < 0.5) {
                    console.log("you miss the " + game.dungeons[game.level].creatures[i].name);
                }
                else {
                    console.log("you kill the " + game.dungeons[game.level].creatures[i].name);
                    var corpse = {
                        x: x,
                        y: y
                    }
                    game.dungeons[game.level].corpses.push(corpse);
                    game.dungeons[game.level].creatures.splice(i, 1);
                }
            }
        }
        for (var i = 0; i < game.dungeons[game.level].chests.length; i++) {
            if (x == game.dungeons[game.level].chests[i].x && y == game.dungeons[game.level].chests[i].y) {
                move = false;
                var roll = Math.random();
                if (roll > 0.5) {
                    console.log("you open the chest");
                    var loot = game.dungeons[game.level].chests[i].loot;
                    if (loot == null) {
                        console.log("there is nothing inside");
                    }
                    else {
                        game.player.inventory.push(loot);
                        console.log("you loot a " + loot.name);
                    }
                    game.dungeons[game.level].chests.splice(i, 1);
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
        game.dungeons[game.level].playerX = x;
        game.dungeons[game.level].playerY = y;
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

function centerView(x, y) {
    view.x = x - Math.round(view.width / 2);
    view.y = y - Math.round(view.height / 2);
    if (view.x < 0) {
        view.x = 0;
    }
    if (view.x + view.width > game.dungeons[game.level].width) {
        view.x = game.dungeons[game.level].width - view.width;
    }
    if (view.y < 0) {
        view.y = 0;
    }
    if (view.y + view.height > game.dungeons[game.level].height) {
        view.y = game.dungeons[game.level].height - view.height;
    }
}

function tickCreature(creature) {
    if (creature.x == game.dungeons[game.level].playerX && creature.y - 1 == game.dungeons[game.level].playerY) {
        moveCreature(creature, creature.x, creature.y - 1);
    } else if (creature.x + 1 == game.dungeons[game.level].playerX && creature.y == game.dungeons[game.level].playerY) {
        moveCreature(creature, creature.x + 1, creature.y);
    } else if (creature.x == game.dungeons[game.level].playerX && creature.y + 1 == game.dungeons[game.level].playerY) {
        moveCreature(creature, creature.x, creature.y + 1);
    } else if (creature.x == game.dungeons[game.level].playerX && creature.y + 1 == game.dungeons[game.level].playerY) {
        moveCreature(creature, creature.x - 1, creature.y);
    } else {
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
    if (x >= 0 && x < game.dungeons[game.level].width && y >= 0 && y < game.dungeons[game.level].height) {
        if (game.dungeons[game.level].cells[x][y].type == "wall") {
            move = false;
        }
        if (game.dungeons[game.level].cells[x][y].type == "doorClosed") {
            move = false;
        }
        if (game.dungeons[game.level].cells[x][y].type == "stairsUp") {
            move = false;
        }
        if (game.dungeons[game.level].cells[x][y].type == "stairsDown") {
            move = false;
        }
        if (x == game.dungeons[game.level].playerX && y == game.dungeons[game.level].playerY) {
            move = false;
            var roll = Math.random();
            if (roll < 0.5) {
                console.log("the " + creature.name + " misses you");
            }
            else {
                console.log("the " + creature.name + " attacks you");
            }
        }
        for (var i = 0; i < game.dungeons[game.level].creatures.length; i++) {
            if (game.dungeons[game.level].creatures[i] == creature) {
                continue;
            }
            if (x == game.dungeons[game.level].creatures[i].x && y == game.dungeons[game.level].creatures[i].y) {
                move = false;
            }
        }
        for (var i = 0; i < game.dungeons[game.level].chests.length; i++) {
            if (x == game.dungeons[game.level].chests[i].x && y == game.dungeons[game.level].chests[i].y) {
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

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
    if (game.drawMode == "game") {
        if (e.keyCode == 38) {
            movePlayer(game.dungeons[game.level].playerX, game.dungeons[game.level].playerY - 1);
        }
        if (e.keyCode == 39) {
            movePlayer(game.dungeons[game.level].playerX + 1, game.dungeons[game.level].playerY);
        }
        if (e.keyCode == 40) {
            movePlayer(game.dungeons[game.level].playerX, game.dungeons[game.level].playerY + 1);
        }
        if (e.keyCode == 37) {
            movePlayer(game.dungeons[game.level].playerX - 1, game.dungeons[game.level].playerY);
        }
    }
    if (e.keyCode == 27) {
        game.drawMode = "game";
        draw();
    }
    if (e.keyCode == 73) {
        game.drawMode = "inventory";
        draw();
    }
    if (e.keyCode == 81) {
        localStorage.setItem("game", JSON.stringify(game));
        console.log("game saved");
    }
    if (e.keyCode == 69) {
        game = JSON.parse(localStorage.getItem("game"));
        console.log("game loaded");
        changeLevel(game.level);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

changeLevel(0);