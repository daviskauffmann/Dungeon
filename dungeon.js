var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var game = new Game(14);
var view;
var map;
var cells;
var rooms;
var player;
var creatures;
var chests;
game.reset();

function Game(characterSize) {
    this.characterSize = characterSize;
    this.turn = 0;
    this.level = 1;
    this.drawMode = "game";
    this.tick = function () {
        for (var i = 0; i < creatures.length; i++) {
            creatures[i].tick();
        }
        this.turn++;
        this.draw();
    }
    this.reset = function () {
        view = new View(Math.round(canvas.width / game.characterSize), Math.round(canvas.height / game.characterSize));
        map = new Map(50, 50);
        cells = [];
        createCells();
        rooms = [];
        createRooms(20, 5, 15, true, 0.5);
        player = new Player();
        movePlayerToRoom();
        creatures = [];
        spawnCreatures(10);
        chests = [];
        spawnChests(5);
        this.draw();
        console.log("welcome to level " + this.level);
    }
    this.draw = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        switch (this.drawMode) {
            case "game":
                for (var x = view.x; x < view.x + view.width; x++) {
                    for (var y = view.y; y < view.y + view.height; y++) {
                        //if (x < 0 || x >= map.width || y < 0 || y > map.width) {
                        //    continue;
                        //}
                        ctx.fillStyle = "#fff";
                        ctx.font = game.characterSize + "px";
                        if (x == player.x && y == player.y) {
                            ctx.fillText("@", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                            continue;
                        }
                        var creature = false;
                        for (var i = 0; i < creatures.length; i++) {
                            if (x == creatures[i].x && y == creatures[i].y) {
                                ctx.fillText(creatures[i].char, (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                creature = true;
                            }
                        }
                        if (creature) {
                            continue;
                        }
                        var chest = false;
                        for (var i = 0; i < chests.length; i++) {
                            if (x == chests[i].x && y == chests[i].y) {
                                ctx.fillText("~", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                chest = true;
                            }
                        }
                        if (chest) {
                            continue;
                        }
                        switch (cells[x][y].type) {
                            case "empty":
                                ctx.fillText("", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                break;
                            case "floor":
                                //if (cells[x][y].room != null) {// && cells[x][y].room.discovered) {
                                //    ctx.fillText(rooms.indexOf(cells[x][y].room).toString(), (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                //}
                                //else {
                                //    ctx.fillText("-", (x - view.x) * game.characterSize, (y - view.y + 1) * game.characterSize);
                                //}
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

function View(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.move = function (x, y) {
        this.x = x - Math.round((canvas.width / game.characterSize) / 2);
        this.y = y - Math.round((canvas.height / game.characterSize) / 2);
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > map.width) {
            this.x = map.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > map.height) {
            this.y = map.height - this.height;
        }
    }
}

function Map(width, height) {
    this.width = width;
    this.height = height;
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.type = "empty";
    this.room = null;
}

function createCells() {
    for (var x = 0; x < map.width; x++) {
        cells[x] = [];
        for (var y = 0; y < map.height; y++) {
            cells[x][y] = new Cell(x, y);
        }
    }
}

function Room(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    //this.discovered = false;
}

function createRooms(attempts, minSize, maxSize, preventOverlap, doorChance) {
    for (var i = 0; i < attempts; i++) {
        var roomX = getRandomInt(0, map.width);
        var roomY = getRandomInt(0, map.height);
        var roomWidth = getRandomInt(minSize, maxSize);
        var roomHeight = getRandomInt(minSize, maxSize);
        // check bounds
        if (roomX < 1 || roomX + roomWidth >= map.width || roomY < 1 || roomY + roomHeight >= map.height) {
            continue;
        }
        // check overlap
        if (preventOverlap) {
            var overlap = false;
            for (var x = roomX; x < roomX + roomWidth; x++) {
                for (var y = roomY; y < roomY + roomHeight; y++) {
                    if (cells[x][y].room != null) {
                        overlap = true;
                    }
                    if (y - 1 >= 0 && cells[x][y - 1].room != null) {
                        overlap = true;
                    }
                    if (x + 1 < map.width && cells[x + 1][y].room != null) {
                        overlap = true;
                    }
                    if (y + 1 < map.height && cells[x][y + 1].room != null) {
                        overlap = true;
                    }
                    if (x - 1 >= 0 && cells[x - 1][y].room != null) {
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
                cells[x][y].room = room;
                cells[x][y].type = "floor";
            }
        }
        // add to the list
        rooms.push(room);
    }

    // connect rooms
    for (var i = 0; i < rooms.length - 1; i++) {
        var x1 = getRandomInt(rooms[i].x, rooms[i].x + rooms[i].width);
        var y1 = getRandomInt(rooms[i].y, rooms[i].y + rooms[i].height);
        var x2 = getRandomInt(rooms[i + 1].x, rooms[i + 1].x + rooms[i + 1].width);
        var y2 = getRandomInt(rooms[i + 1].y, rooms[i + 1].y + rooms[i + 1].height);
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
                    cells[x][y].type = "floor";
                    //cells[x][y].room = rooms[i];
                }
            }
        }
    }

    // walls
    for (var x = 0; x < map.width; x++) {
        for (var y = 0; y < map.height; y++) {
            if (cells[x][y].type == "floor") {
                if (y - 1 >= 0 && cells[x][y - 1].type == "empty") {
                    cells[x][y - 1].type = "wall";
                }
                if (x + 1 < map.width && cells[x + 1][y].type == "empty") {
                    cells[x + 1][y].type = "wall";
                }
                if (y + 1 < map.height && cells[x][y + 1].type == "empty") {
                    cells[x][y + 1].type = "wall";
                }
                if (x - 1 >= 0 && cells[x - 1][y].type == "empty") {
                    cells[x - 1][y].type = "wall";
                }
            }
        }
    }

    // doors
    for (var x = 0; x < map.width; x++) {
        for (var y = 0; y < map.height; y++) {
            if (Math.random() < doorChance) {
                if (cells[x][y].type == "floor") {
                    if (y - 1 >= 0 && x + 1 < map.width && x - 1 >= 0) {
                        if (cells[x][y - 1].type == "floor" && cells[x + 1][y - 1].type == "floor" && cells[x - 1][y - 1].type == "floor") {
                            if (cells[x - 1][y].type == "wall" && cells[x + 1][y].type == "wall") {
                                cells[x][y].type = "doorClosed";
                            }
                        }
                    }
                    if (x + 1 < map.width && y + 1 < map.height && y - 1 >= 0) {
                        if (cells[x + 1][y].type == "floor" && cells[x + 1][y - 1].type == "floor" && cells[x + 1][y + 1].type == "floor") {
                            if (cells[x][y + 1].type == "wall" && cells[x][y - 1].type == "wall") {
                                cells[x][y].type = "doorClosed";
                            }
                        }
                    }
                    if (y + 1 < map.height && x + 1 < map.width && x - 1 >= 0) {
                        if (cells[x][y + 1].type == "floor" && cells[x + 1][y + 1].type == "floor" && cells[x - 1][y + 1].type == "floor") {
                            if (cells[x - 1][y].type == "wall" && cells[x + 1][y].type == "wall") {
                                cells[x][y].type = "doorClosed";
                            }
                        }
                    }
                    if (x - 1 >= 0 && y + 1 < map.height && y - 1 >= 0) {
                        if (cells[x - 1][y].type == "floor" && cells[x - 1][y - 1].type == "floor" && cells[x - 1][y + 1].type == "floor") {
                            if (cells[x][y + 1].type == "wall" && cells[x][y - 1].type == "wall") {
                                cells[x][y].type = "doorClosed";
                            }
                        }
                    }
                }
            }
        }
    }

    //stairs
    if (rooms.length > 0) {
        var x = getRandomInt(rooms[0].x, rooms[0].x + rooms[0].width);
        var y = getRandomInt(rooms[0].y, rooms[0].y + rooms[0].height);
        cells[x][y].type = "stairsUp";
        var x = getRandomInt(rooms[rooms.length - 1].x, rooms[rooms.length - 1].x + rooms[rooms.length - 1].width);
        var y = getRandomInt(rooms[rooms.length - 1].y, rooms[rooms.length - 1].y + rooms[rooms.length - 1].height);
        cells[x][y].type = "stairsDown";
    }
}

function Player() {
    this.x = 0;
    this.y = 0;
    this.inventory = [];
    this.move = function (x, y) {
        var valid = true;
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
            if (cells[x][y].type == "wall") {
                valid = false;
            }
            if (cells[x][y].type == "doorClosed") {
                valid = false;
                var roll = Math.random();
                if (roll > 0.5) {
                    console.log("you open the door");
                    cells[x][y].type = "doorOpen";
                }
                else {
                    console.log("the door won't budge");
                }
            }
            if (cells[x][y].type == "stairsDown") {
                console.log("you go deeper");
                game.level++;
                game.reset();
                return;
            }
            for (var i = 0; i < creatures.length; i++) {
                if (x == creatures[i].x && y == creatures[i].y) {
                    valid = false;
                    var roll = Math.random();
                    if (roll < 0.5) {
                        console.log("you miss the " + creatures[i].name);
                    }
                    else {
                        console.log("you kill the " + creatures[i].name);
                        creatures.splice(i, 1);
                    }
                }
            }
            for (var i = 0; i < chests.length; i++) {
                if (x == chests[i].x && y == chests[i].y) {
                    valid = false;
                    var roll = Math.random();
                    if (roll > 0.5) {
                        console.log("you open the chest");
                        var loot = chests[i].loot();
                        chests.splice(i, 1);
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
            valid = false;
        }
        if (valid) {
            this.x = x;
            this.y = y;
            view.move(x, y);
        }
        game.tick();
        //console.log("player (" + this.x + ", " + this.y + ")" + " " + cells[this.x][this.y].type);
        //if (cells[this.x][this.y].room != null) {
        //    cells[this.x][this.y].room.discovered = true;
        //}
    }
}

function movePlayerToRoom() {
    for (var x = 0; x < map.width; x++) {
        for (var y = 0; y < map.height; y++) {
            if (cells[x][y].type == "stairsUp") {
                player.x = x;
                player.y = y;
                view.move(x, y);
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
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
            if (cells[x][y].type == "wall") {
                valid = false;
            }
            if (cells[x][y].type == "doorClosed") {
                valid = false;
            }
            if (cells[x][y].type == "stairsUp") {
                valid = false;
            }
            if (cells[x][y].type == "stairsDown") {
                valid = false;
            }
            if (x == player.x && y == player.y) {
                valid = false;
                var roll = Math.random();
                if (roll < 0.5) {
                    console.log("the " + this.name + " misses you");
                }
                else {
                    console.log("the " + this.name + " attacks you");
                }
            }
            for (var i = 0; i < creatures.length; i++) {
                if (creatures[i] == this) {
                    continue;
                }
                if (x == creatures[i].x && y == creatures[i].y) {
                    valid = false;
                }
            }
            for (var i = 0; i < chests.length; i++) {
                if (x == chests[i].x && y == chests[i].y) {
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
        if (rooms.length > 1) {
            var roomIndex = getRandomInt(1, rooms.length);
            var x = getRandomInt(rooms[roomIndex].x, rooms[roomIndex].x + rooms[roomIndex].width);
            var y = getRandomInt(rooms[roomIndex].y, rooms[roomIndex].y + rooms[roomIndex].height);
            var roll = Math.random();
            if (roll < 0.3) {
                creatures.push(new Creature(x, y, "rat", "r"));
            } else if (roll < 0.6) {
                creatures.push(new Creature(x, y, "orc", "o"));
            } else {
                creatures.push(new Creature(x, y, "slime", "s"));
            }
        }
    }
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
        if (rooms.length > 0) {
            var roomIndex = getRandomInt(0, rooms.length);
            var x = getRandomInt(rooms[roomIndex].x, rooms[roomIndex].x + rooms[roomIndex].width);
            var y = getRandomInt(rooms[roomIndex].y, rooms[roomIndex].y + rooms[roomIndex].height);
            chests.push(new Chest(x, y));
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
            player.move(player.x, player.y - 1);
        }
        if (e.keyCode == 39) {
            player.move(player.x + 1, player.y);
        }
        if (e.keyCode == 40) {
            player.move(player.x, player.y + 1);
        }
        if (e.keyCode == 37) {
            player.move(player.x - 1, player.y);
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
        //localStorage.setItem("player", JSON.stringify(player));
    }
    if (e.keyCode == 69) {
        //var playerSave = JSON.parse(localStorage.getItem("player"));
        //player.x = playerSave.x;
        //player.y = playerSave.y;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}