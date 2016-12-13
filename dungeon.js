var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = new Game(14);
var view = new View(Math.round(canvas.width / game.characterSize), Math.round(canvas.height / game.characterSize));
var level = 0;
var dungeons = [];
game.changeLevel();

function Game(characterSize) {
    this.characterSize = characterSize;
    this.turn = 0;
    this.drawMode = "game";
    this.tick = function () {
        for (var i = 0; i < dungeons[level].creatures.length; i++) {
            dungeons[level].creatures[i].tick();
        }
        this.turn++;
        this.draw();
    }
    this.changeLevel = function () {
        if (level == dungeons.length) {
            dungeons.push(new Dungeon());
            dungeons[level].width = 50;
            dungeons[level].height = 50;
            dungeons[level].cells = [];
            createCells();
            dungeons[level].rooms = [];
            createRooms(20, 5, 15, true, 0.5);
            dungeons[level].player = new Player();
            movePlayerToRoom();
            dungeons[level].creatures = [];
            spawnCreatures(10);
            dungeons[level].corpses = [];
            dungeons[level].chests = [];
            spawnChests(5);
        }
        dungeons[level].player.calculateLOS();
        view.center(dungeons[level].player.x, dungeons[level].player.y);
        this.draw();
        console.log("welcome to level " + (level + 1));
    }
    this.draw = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (this.drawMode) {
            case "game":
                for (var x = view.x; x < view.x + view.width; x++) {
                    for (var y = view.y; y < view.y + view.height; y++) {
                        if (x < 0 || x >= dungeons[level].width || y < 0 || y >= dungeons[level].height) {
                            continue;
                        }
                        if (dungeons[level].cells[x][y].visible) {
                            ctx.fillStyle = "#fff";
                            ctx.font = game.characterSize + "px";
                            if (x == dungeons[level].player.x && y == dungeons[level].player.y) {
                                ctx.fillText("@", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                continue;
                            }
                            var creature = false;
                            for (var i = 0; i < dungeons[level].creatures.length; i++) {
                                if (x == dungeons[level].creatures[i].x && y == dungeons[level].creatures[i].y) {
                                    ctx.fillText(dungeons[level].creatures[i].char, (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    creature = true;
                                }
                            }
                            if (creature) {
                                continue;
                            }
                            var corpse = false;
                            for (var i = 0; i < dungeons[level].corpses.length; i++) {
                                if (x == dungeons[level].corpses[i].x && y == dungeons[level].corpses[i].y) {
                                    ctx.fillText("%", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    corpse = true;
                                }
                            }
                            if (corpse) {
                                continue;
                            }
                            var chest = false;
                            for (var i = 0; i < dungeons[level].chests.length; i++) {
                                if (x == dungeons[level].chests[i].x && y == dungeons[level].chests[i].y) {
                                    ctx.fillText("~", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    chest = true;
                                }
                            }
                            if (chest) {
                                continue;
                            }
                            switch (dungeons[level].cells[x][y].type) {
                                case "empty":
                                    ctx.fillText(" ", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "floor":
                                    ctx.fillText(".", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "wall":
                                    ctx.fillText("#", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "doorClosed":
                                    ctx.fillText("+", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "doorOpen":
                                    ctx.fillText("'", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "stairsUp":
                                    ctx.fillText("<", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                                case "stairsDown":
                                    ctx.fillText(">", (x - view.x + 1) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                    break;
                            }
                        }
                    }
                }
                break;
            case "menu":
                ctx.fillStyle = "#fff";
                ctx.fillText("Paused", 10, 10);
                break;
        }
    }
}

function Dungeon() {

}

function View(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.center = function (x, y) {
        this.x = x - Math.round(width / 2);
        this.y = y - Math.round(height / 2);
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > dungeons[level].width) {
            this.x = dungeons[level].width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > dungeons[level].height) {
            this.y = dungeons[level].height - this.height;
        }
    }
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.type = "empty";
    this.visible = true;
}

function createCells() {
    for (var x = 0; x < dungeons[level].width; x++) {
        dungeons[level].cells[x] = [];
        for (var y = 0; y < dungeons[level].height; y++) {
            dungeons[level].cells[x][y] = new Cell(x, y);
        }
    }
}

function Room(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function createRooms(attempts, minSize, maxSize, preventOverlap, doorChance) {
    for (var i = 0; i < attempts; i++) {
        var roomX = getRandomInt(0, dungeons[level].width);
        var roomY = getRandomInt(0, dungeons[level].height);
        var roomWidth = getRandomInt(minSize, maxSize);
        var roomHeight = getRandomInt(minSize, maxSize);
        // check bounds
        if (roomX < 1 || roomX + roomWidth > dungeons[level].width - 1 || roomY < 1 || roomY + roomHeight > dungeons[level].height - 1) {
            continue;
        }
        // check overlap
        if (preventOverlap) {
            var overlap = false;
            for (var x = roomX; x < roomX + roomWidth; x++) {
                for (var y = roomY; y < roomY + roomHeight; y++) {
                    if (dungeons[level].cells[x][y].type == "floor") {
                        overlap = true;
                    }
                    if (dungeons[level].cells[x][y - 1].type == "floor") {
                        overlap = true;
                    }
                    if (dungeons[level].cells[x + 1][y].type == "floor") {
                        overlap = true;
                    }
                    if (dungeons[level].cells[x][y + 1].type == "floor") {
                        overlap = true;
                    }
                    if (dungeons[level].cells[x - 1][y].type == "floor") {
                        overlap = true;
                    }
                }
            }
            if (overlap) {
                continue;
            }
        }
        // create a room
        var room = new Room(roomX, roomY, roomWidth, roomHeight);
        // assign cells
        for (var x = room.x; x < room.x + room.width; x++) {
            for (var y = room.y; y < room.y + room.height; y++) {
                dungeons[level].cells[x][y].type = "floor";
            }
        }
        // add to the list
        dungeons[level].rooms.push(room);
    }

    // connect rooms
    for (var i = 0; i < dungeons[level].rooms.length - 1; i++) {
        var x1 = getRandomInt(dungeons[level].rooms[i].x, dungeons[level].rooms[i].x + dungeons[level].rooms[i].width);
        var y1 = getRandomInt(dungeons[level].rooms[i].y, dungeons[level].rooms[i].y + dungeons[level].rooms[i].height);
        var x2 = getRandomInt(dungeons[level].rooms[i + 1].x, dungeons[level].rooms[i + 1].x + dungeons[level].rooms[i + 1].width);
        var y2 = getRandomInt(dungeons[level].rooms[i + 1].y, dungeons[level].rooms[i + 1].y + dungeons[level].rooms[i + 1].height);
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
                    dungeons[level].cells[x][y].type = "floor";
                }
            }
        }
    }

    // walls
    for (var x = 0; x < dungeons[level].width; x++) {
        for (var y = 0; y < dungeons[level].height; y++) {
            if (dungeons[level].cells[x][y].type == "floor") {
                if (dungeons[level].cells[x][y - 1].type == "empty") {
                    dungeons[level].cells[x][y - 1].type = "wall";
                }
                if (dungeons[level].cells[x + 1][y].type == "empty") {
                    dungeons[level].cells[x + 1][y].type = "wall";
                }
                if (dungeons[level].cells[x][y + 1].type == "empty") {
                    dungeons[level].cells[x][y + 1].type = "wall";
                }
                if (dungeons[level].cells[x - 1][y].type == "empty") {
                    dungeons[level].cells[x - 1][y].type = "wall";
                }
            }
        }
    }

    // doors
    for (var x = 0; x < dungeons[level].width; x++) {
        for (var y = 0; y < dungeons[level].height; y++) {
            if (Math.random() < doorChance) {
                if (dungeons[level].cells[x][y].type == "floor") {
                    if (dungeons[level].cells[x][y - 1].type == "floor" && dungeons[level].cells[x + 1][y - 1].type == "floor" && dungeons[level].cells[x - 1][y - 1].type == "floor") {
                        if (dungeons[level].cells[x - 1][y].type == "wall" && dungeons[level].cells[x + 1][y].type == "wall") {
                            dungeons[level].cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeons[level].cells[x + 1][y].type == "floor" && dungeons[level].cells[x + 1][y - 1].type == "floor" && dungeons[level].cells[x + 1][y + 1].type == "floor") {
                        if (dungeons[level].cells[x][y + 1].type == "wall" && dungeons[level].cells[x][y - 1].type == "wall") {
                            dungeons[level].cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeons[level].cells[x][y + 1].type == "floor" && dungeons[level].cells[x + 1][y + 1].type == "floor" && dungeons[level].cells[x - 1][y + 1].type == "floor") {
                        if (dungeons[level].cells[x - 1][y].type == "wall" && dungeons[level].cells[x + 1][y].type == "wall") {
                            dungeons[level].cells[x][y].type = "doorClosed";
                        }
                    }
                    if (dungeons[level].cells[x - 1][y].type == "floor" && dungeons[level].cells[x - 1][y - 1].type == "floor" && dungeons[level].cells[x - 1][y + 1].type == "floor") {
                        if (dungeons[level].cells[x][y + 1].type == "wall" && dungeons[level].cells[x][y - 1].type == "wall") {
                            dungeons[level].cells[x][y].type = "doorClosed";
                        }
                    }
                }
            }
        }
    }

    //stairs
    if (dungeons[level].rooms.length > 0) {
        var x = getRandomInt(dungeons[level].rooms[0].x, dungeons[level].rooms[0].x + dungeons[level].rooms[0].width);
        var y = getRandomInt(dungeons[level].rooms[0].y, dungeons[level].rooms[0].y + dungeons[level].rooms[0].height);
        dungeons[level].cells[x][y].type = "stairsUp";
        var x = getRandomInt(dungeons[level].rooms[dungeons[level].rooms.length - 1].x, dungeons[level].rooms[dungeons[level].rooms.length - 1].x + dungeons[level].rooms[dungeons[level].rooms.length - 1].width);
        var y = getRandomInt(dungeons[level].rooms[dungeons[level].rooms.length - 1].y, dungeons[level].rooms[dungeons[level].rooms.length - 1].y + dungeons[level].rooms[dungeons[level].rooms.length - 1].height);
        dungeons[level].cells[x][y].type = "stairsDown";
    }
}

function Player() {
    this.x = 0;
    this.y = 0;
    this.inventory = [];
    this.move = function (x, y) {
        var move = true;
        var tick = true;
        if (x >= 0 && x < dungeons[level].width && y >= 0 && y < dungeons[level].height) {
            if (dungeons[level].cells[x][y].type == "wall") {
                move = false;
            }
            if (dungeons[level].cells[x][y].type == "doorClosed") {
                move = false;
                var roll = Math.random();
                if (roll > 0.5) {
                    console.log("you open the door");
                    dungeons[level].cells[x][y].type = "doorOpen";
                }
                else {
                    console.log("the door won't budge");
                }
            }
            if (dungeons[level].cells[x][y].type == "stairsUp") {
                if (level == 0) {
                    document.location.reload();
                }
                else {
                    console.log("you ascend");
                    level--;
                    game.changeLevel();
                    tick = false;
                }
            }
            if (dungeons[level].cells[x][y].type == "stairsDown") {
                console.log("you descend");
                level++;
                game.changeLevel();
                tick = false;
            }
            for (var i = 0; i < dungeons[level].creatures.length; i++) {
                if (x == dungeons[level].creatures[i].x && y == dungeons[level].creatures[i].y) {
                    move = false;
                    var roll = Math.random();
                    if (roll < 0.5) {
                        console.log("you miss the " + dungeons[level].creatures[i].name);
                    }
                    else {
                        console.log("you kill the " + dungeons[level].creatures[i].name);
                        dungeons[level].corpses.push(new Corpse(x, y));
                        dungeons[level].creatures.splice(i, 1);
                    }
                }
            }
            for (var i = 0; i < dungeons[level].chests.length; i++) {
                if (x == dungeons[level].chests[i].x && y == dungeons[level].chests[i].y) {
                    move = false;
                    var roll = Math.random();
                    if (roll > 0.5) {
                        console.log("you open the chest");
                        var loot = dungeons[level].chests[i].loot();
                        dungeons[level].chests.splice(i, 1);
                        if (loot == null) {
                            console.log("there is nothing inside");
                        }
                        else {
                            this.inventory.push(loot);
                            console.log("you loot a " + loot.name);
                        }
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
            this.x = x;
            this.y = y;
            this.calculateLOS();
            view.center(x, y);
        }
        if (tick) {
            game.tick();
        }
        //console.log("player (" + this.x + ", " + this.y + ")" + " " + dungeons[level].cells[this.x][this.y].type);
    }
    this.calculateLOS = function () {
        for (var x = 0; x < dungeons[level].width; x++) {
            for (var y = 0; y < dungeons[level].height; y++) {
                //dungeons[level].cells[x][y].visible = false;
            }
        }
    }
}

function movePlayerToRoom() {
    for (var x = 0; x < dungeons[level].width; x++) {
        for (var y = 0; y < dungeons[level].height; y++) {
            if (dungeons[level].cells[x][y].type == "stairsUp") {
                dungeons[level].player.x = x;
                dungeons[level].player.y = y;
                break;
            }
        }
    }
}

function Creature(x, y, name, char) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.char = char;
    this.move = function (x, y) {
        var valid = true;
        if (x >= 0 && x < dungeons[level].width && y >= 0 && y < dungeons[level].height) {
            if (dungeons[level].cells[x][y].type == "wall") {
                valid = false;
            }
            if (dungeons[level].cells[x][y].type == "doorClosed") {
                valid = false;
            }
            if (dungeons[level].cells[x][y].type == "stairsUp") {
                valid = false;
            }
            if (dungeons[level].cells[x][y].type == "stairsDown") {
                valid = false;
            }
            if (x == dungeons[level].player.x && y == dungeons[level].player.y) {
                valid = false;
                var roll = Math.random();
                if (roll < 0.5) {
                    console.log("the " + this.name + " misses you");
                }
                else {
                    console.log("the " + this.name + " attacks you");
                }
            }
            for (var i = 0; i < dungeons[level].creatures.length; i++) {
                if (dungeons[level].creatures[i] == this) {
                    continue;
                }
                if (x == dungeons[level].creatures[i].x && y == dungeons[level].creatures[i].y) {
                    valid = false;
                }
            }
            for (var i = 0; i < dungeons[level].chests.length; i++) {
                if (x == dungeons[level].chests[i].x && y == dungeons[level].chests[i].y) {
                    valid = false;
                }
            }
        }
        else {
            valid = false;
        }
        if (valid) {
            this.x = x;
            this.y = y;
        }
    }
    this.tick = function () {
        var roll = Math.random();
        if (roll < 0.25) {
            this.move(this.x, this.y - 1);
        } else if (roll < 0.5) {
            this.move(this.x + 1, this.y);
        } else if (roll < 0.75) {
            this.move(this.x, this.y + 1);
        } else {
            this.move(this.x - 1, this.y);
        }
    }
}

function spawnCreatures(amount) {
    for (var i = 0; i < amount; i++) {
        if (dungeons[level].rooms.length > 1) {
            var roomIndex = getRandomInt(1, dungeons[level].rooms.length);
            var x = getRandomInt(dungeons[level].rooms[roomIndex].x, dungeons[level].rooms[roomIndex].x + dungeons[level].rooms[roomIndex].width);
            var y = getRandomInt(dungeons[level].rooms[roomIndex].y, dungeons[level].rooms[roomIndex].y + dungeons[level].rooms[roomIndex].height);
            var roll = Math.random();
            if (roll < 0.3) {
                dungeons[level].creatures.push(new Creature(x, y, "rat", "r"));
            } else if (roll < 0.6) {
                dungeons[level].creatures.push(new Creature(x, y, "orc", "o"));
            } else {
                dungeons[level].creatures.push(new Creature(x, y, "slime", "s"));
            }
        }
    }
}

function Corpse(x, y) {
    this.x = x;
    this.y = y;
}

function Chest(x, y) {
    this.x = x;
    this.y = y;
    this.loot = function () {
        var roll = Math.random();
        if (roll < 0.5) {
            return null;
        }
        else {
            return new Item("sword");
        }
    }
}

function spawnChests(amount) {
    for (var i = 0; i < amount; i++) {
        if (dungeons[level].rooms.length > 0) {
            var roomIndex = getRandomInt(0, dungeons[level].rooms.length);
            var x = getRandomInt(dungeons[level].rooms[roomIndex].x, dungeons[level].rooms[roomIndex].x + dungeons[level].rooms[roomIndex].width);
            var y = getRandomInt(dungeons[level].rooms[roomIndex].y, dungeons[level].rooms[roomIndex].y + dungeons[level].rooms[roomIndex].height);
            dungeons[level].chests.push(new Chest(x, y));
        }
    }
}

function Item(name) {
    this.name = name;
}

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
    if (game.drawMode == "game") {
        if (e.keyCode == 38) {
            dungeons[level].player.move(dungeons[level].player.x, dungeons[level].player.y - 1);
        }
        if (e.keyCode == 39) {
            dungeons[level].player.move(dungeons[level].player.x + 1, dungeons[level].player.y);
        }
        if (e.keyCode == 40) {
            dungeons[level].player.move(dungeons[level].player.x, dungeons[level].player.y + 1);
        }
        if (e.keyCode == 37) {
            dungeons[level].player.move(dungeons[level].player.x - 1, dungeons[level].player.y);
        }
    }
    if (e.keyCode == 27) {
        if (game.drawMode == "menu") {
            game.drawMode = "game";
        } else {
            game.drawMode = "menu";
        }
    }
    if (e.keyCode == 81) {
        console.log(JSON.stringify(dungeons));
    }
    if (e.keyCode == 69) {

    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}