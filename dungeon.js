/*
TODO
    calculate stuff in other dungeons
    line of sight
    font size
*/

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = new Game(14);
var player = new Player();
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
            var dungeon = new Dungeon(50, 50);
            dungeon.createCells();
            dungeon.createRooms(20, 5, 15, true, 0.5);
            dungeon.spawnPlayer();
            dungeon.spawnCreatures(10);
            dungeon.spawnChests(5);
            dungeons.push(dungeon);
        }
        view.center(dungeons[level].playerX, dungeons[level].playerY);
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
                        ctx.fillStyle = "#fff";
                        ctx.font = game.characterSize + "px";
                        if (x == dungeons[level].playerX && y == dungeons[level].playerY) {
                            ctx.fillText("@", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                            continue;
                        }
                        var creature = false;
                        for (var i = 0; i < dungeons[level].creatures.length; i++) {
                            if (x == dungeons[level].creatures[i].x && y == dungeons[level].creatures[i].y) {
                                ctx.fillText(dungeons[level].creatures[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                creature = true;
                            }
                        }
                        if (creature) {
                            continue;
                        }
                        var corpse = false;
                        for (var i = 0; i < dungeons[level].corpses.length; i++) {
                            if (x == dungeons[level].corpses[i].x && y == dungeons[level].corpses[i].y) {
                                ctx.fillText("%", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                corpse = true;
                            }
                        }
                        if (corpse) {
                            continue;
                        }
                        var chest = false;
                        for (var i = 0; i < dungeons[level].chests.length; i++) {
                            if (x == dungeons[level].chests[i].x && y == dungeons[level].chests[i].y) {
                                ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                chest = true;
                            }
                        }
                        if (chest) {
                            continue;
                        }
                        switch (dungeons[level].cells[x][y].type) {
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
                                ctx.fillText("'", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
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
                break;
            case "menu":
                ctx.fillStyle = "#fff";
                ctx.fillText("Paused", 10, 10);
                break;
        }
    }
}

function Player() {
    this.inventory = [];
    this.move = function (x, y) {
        var move = true;
        var ascend = false;
        var descend = false;
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
                    ascend = true;
                }
            }
            if (dungeons[level].cells[x][y].type == "stairsDown") {
                console.log("you descend");
                descend = true;
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
            dungeons[level].playerX = x;
            dungeons[level].playerY = y;
            view.center(x, y);
            game.tick();
        }
        if (ascend) {
            level--;
            game.changeLevel();
        }
        if (descend) {
            level++;
            game.changeLevel();
        }
        //console.log("player (" + this.x + ", " + this.y + ")" + " " + dungeons[level].cells[this.x][this.y].type);
    }
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

function Dungeon(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.rooms = [];
    this.playerX = 0;
    this.playerY = 0;
    this.creatures = [];
    this.corpses = [];
    this.chests = [];
    this.createCells = function () {
        for (var x = 0; x < this.width; x++) {
            this.cells[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.cells[x][y] = new Cell();
            }
        }
    }
    this.createRooms = function (attempts, minSize, maxSize, preventOverlap, doorChance) {
        for (var i = 0; i < attempts; i++) {
            var roomX = getRandomInt(0, this.width);
            var roomY = getRandomInt(0, this.height);
            var roomWidth = getRandomInt(minSize, maxSize);
            var roomHeight = getRandomInt(minSize, maxSize);
            // check bounds
            if (roomX < 1 || roomX + roomWidth > this.width - 1 || roomY < 1 || roomY + roomHeight > this.height - 1) {
                continue;
            }
            // check overlap
            if (preventOverlap) {
                var overlap = false;
                for (var x = roomX; x < roomX + roomWidth; x++) {
                    for (var y = roomY; y < roomY + roomHeight; y++) {
                        if (this.cells[x][y].type == "floor") {
                            overlap = true;
                        }
                        if (this.cells[x][y - 1].type == "floor") {
                            overlap = true;
                        }
                        if (this.cells[x + 1][y].type == "floor") {
                            overlap = true;
                        }
                        if (this.cells[x][y + 1].type == "floor") {
                            overlap = true;
                        }
                        if (this.cells[x - 1][y].type == "floor") {
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
                    this.cells[x][y].type = "floor";
                }
            }
            // add to the list
            this.rooms.push(room);
        }

        // connect rooms
        for (var i = 0; i < this.rooms.length - 1; i++) {
            var x1 = getRandomInt(this.rooms[i].x, this.rooms[i].x + this.rooms[i].width);
            var y1 = getRandomInt(this.rooms[i].y, this.rooms[i].y + this.rooms[i].height);
            var x2 = getRandomInt(this.rooms[i + 1].x, this.rooms[i + 1].x + this.rooms[i + 1].width);
            var y2 = getRandomInt(this.rooms[i + 1].y, this.rooms[i + 1].y + this.rooms[i + 1].height);
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
                        this.cells[x][y].type = "floor";
                    }
                }
            }
        }

        // walls
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x][y].type == "floor") {
                    if (this.cells[x][y - 1].type == "empty") {
                        this.cells[x][y - 1].type = "wall";
                    }
                    if (this.cells[x + 1][y].type == "empty") {
                        this.cells[x + 1][y].type = "wall";
                    }
                    if (this.cells[x][y + 1].type == "empty") {
                        this.cells[x][y + 1].type = "wall";
                    }
                    if (this.cells[x - 1][y].type == "empty") {
                        this.cells[x - 1][y].type = "wall";
                    }
                }
            }
        }

        // doors
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (Math.random() < doorChance) {
                    if (this.cells[x][y].type == "floor") {
                        if (this.cells[x][y - 1].type == "floor" && this.cells[x + 1][y - 1].type == "floor" && this.cells[x - 1][y - 1].type == "floor") {
                            if (this.cells[x - 1][y].type == "wall" && this.cells[x + 1][y].type == "wall") {
                                this.cells[x][y].type = "doorClosed";
                            }
                        }
                        if (this.cells[x + 1][y].type == "floor" && this.cells[x + 1][y - 1].type == "floor" && this.cells[x + 1][y + 1].type == "floor") {
                            if (this.cells[x][y + 1].type == "wall" && this.cells[x][y - 1].type == "wall") {
                                this.cells[x][y].type = "doorClosed";
                            }
                        }
                        if (this.cells[x][y + 1].type == "floor" && this.cells[x + 1][y + 1].type == "floor" && this.cells[x - 1][y + 1].type == "floor") {
                            if (this.cells[x - 1][y].type == "wall" && this.cells[x + 1][y].type == "wall") {
                                this.cells[x][y].type = "doorClosed";
                            }
                        }
                        if (this.cells[x - 1][y].type == "floor" && this.cells[x - 1][y - 1].type == "floor" && this.cells[x - 1][y + 1].type == "floor") {
                            if (this.cells[x][y + 1].type == "wall" && this.cells[x][y - 1].type == "wall") {
                                this.cells[x][y].type = "doorClosed";
                            }
                        }
                    }
                }
            }
        }

        //stairs
        if (this.rooms.length > 0) {
            var x = getRandomInt(this.rooms[0].x, this.rooms[0].x + this.rooms[0].width);
            var y = getRandomInt(this.rooms[0].y, this.rooms[0].y + this.rooms[0].height);
            this.cells[x][y].type = "stairsUp";
            var x = getRandomInt(this.rooms[this.rooms.length - 1].x, this.rooms[this.rooms.length - 1].x + this.rooms[this.rooms.length - 1].width);
            var y = getRandomInt(this.rooms[this.rooms.length - 1].y, this.rooms[this.rooms.length - 1].y + this.rooms[this.rooms.length - 1].height);
            this.cells[x][y].type = "stairsDown";
        }
    }
    this.spawnPlayer = function () {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x][y].type == "stairsUp") {
                    this.playerX = x;
                    this.playerY = y;
                    break;
                }
            }
        }
    }
    this.spawnCreatures = function (amount) {
        for (var i = 0; i < amount; i++) {
            if (this.rooms.length > 1) {
                var roomIndex = getRandomInt(1, this.rooms.length);
                var x = getRandomInt(this.rooms[roomIndex].x, this.rooms[roomIndex].x + this.rooms[roomIndex].width);
                var y = getRandomInt(this.rooms[roomIndex].y, this.rooms[roomIndex].y + this.rooms[roomIndex].height);
                var roll = Math.random();
                if (roll < 0.3) {
                    this.creatures.push(new Creature(x, y, "rat", "r"));
                } else if (roll < 0.6) {
                    this.creatures.push(new Creature(x, y, "orc", "o"));
                } else {
                    this.creatures.push(new Creature(x, y, "slime", "s"));
                }
            }
        }
    }
    this.spawnChests = function (amount) {
        for (var i = 0; i < amount; i++) {
            if (this.rooms.length > 0) {
                var roomIndex = getRandomInt(0, this.rooms.length);
                var x = getRandomInt(this.rooms[roomIndex].x, this.rooms[roomIndex].x + this.rooms[roomIndex].width);
                var y = getRandomInt(this.rooms[roomIndex].y, this.rooms[roomIndex].y + this.rooms[roomIndex].height);
                this.chests.push(new Chest(x, y));
            }
        }
    }
}

function Cell() {
    this.type = "empty";
}

function Room(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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
            if (x == dungeons[level].playerX && y == dungeons[level].playerY) {
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

function Item(name) {
    this.name = name;
}

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
    if (game.drawMode == "game") {
        if (e.keyCode == 38) {
            player.move(dungeons[level].playerX, dungeons[level].playerY - 1);
        }
        if (e.keyCode == 39) {
            player.move(dungeons[level].playerX + 1, dungeons[level].playerY);
        }
        if (e.keyCode == 40) {
            player.move(dungeons[level].playerX, dungeons[level].playerY + 1);
        }
        if (e.keyCode == 37) {
            player.move(dungeons[level].playerX - 1, dungeons[level].playerY);
        }
    }
    if (e.keyCode == 27) {
        if (game.drawMode == "menu") {
            game.drawMode = "game";
            game.draw();
        } else {
            game.drawMode = "menu";
            game.draw();
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