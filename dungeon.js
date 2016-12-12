var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var fontSize = 12;
var width = Math.round(canvas.width / fontSize);
var height = Math.round(canvas.height / fontSize);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.type = "empty";
    this.room = null;
}
var cells = [];
for (var x = 0; x < width; x++) {
    cells[x] = [];
    for (var y = 0; y < height; y++) {
        cells[x][y] = new Cell(x, y);
    }
}

function Room(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    //this.discovered = false;
}
var rooms = [];

function createRooms(attempts, minSize, maxSize, preventOverlap, doorChance) {
    for (var i = 0; i < attempts; i++) {
        var roomX = getRandomInt(2, width);
        var roomY = getRandomInt(2, height);
        var roomWidth = getRandomInt(minSize, maxSize);
        var roomHeight = getRandomInt(minSize, maxSize);
        // check bounds
        if (roomX + roomWidth >= width || roomY + roomHeight >= height) {
            continue;
        }
        // check overlap
        if (preventOverlap) {
            var clear = true;
            for (var x = roomX; x < roomX + roomWidth; x++) {
                for (var y = roomY; y < roomY + roomHeight; y++) {
                    if (cells[x][y].room !== null) {
                        clear = false;
                    }
                    if (y - 1 > 0 && cells[x][y - 1].room !== null) {
                        clear = false;
                    }
                    if (x + 1 < width && cells[x + 1][y].room !== null) {
                        clear = false;
                    }
                    if (y + 1 < height && cells[x][y + 1].room !== null) {
                        clear = false;
                    }
                    if (x - 1 > 0 && cells[x - 1][y].room !== null) {
                        clear = false;
                    }
                }
            }
            if (!clear) {
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
        var x1 = Math.round((rooms[i].x + (rooms[i].x + rooms[i].width)) / 2);
        var y1 = Math.round((rooms[i].y + (rooms[i].y + rooms[i].height)) / 2);
        var x2 = Math.round((rooms[i + 1].x + (rooms[i + 1].x + rooms[i + 1].width)) / 2);
        var y2 = Math.round((rooms[i + 1].y + (rooms[i + 1].y + rooms[i + 1].height)) / 2);
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
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (cells[x][y].type == "floor") {
                if (y - 1 > 0 && cells[x][y - 1].type == "empty") {
                    cells[x][y - 1].type = "wall";
                }
                if (x + 1 < width && cells[x + 1][y].type == "empty") {
                    cells[x + 1][y].type = "wall";
                }
                if (y + 1 < height && cells[x][y + 1].type == "empty") {
                    cells[x][y + 1].type = "wall";
                }
                if (x - 1 > 0 && cells[x - 1][y].type == "empty") {
                    cells[x - 1][y].type = "wall";
                }
            }
        }
    }

    // doors
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (Math.random() < doorChance) {
                if (cells[x][y].type == "floor") {
                    if (y - 1 > 0 && x + 1 < width && x - 1 > 0) {
                        if (cells[x][y - 1].type == "floor" && cells[x + 1][y - 1].type == "floor" && cells[x - 1][y - 1].type == "floor") {
                            if (cells[x - 1][y].type == "wall" && cells[x + 1][y].type == "wall") {
                                cells[x][y].type = "door";
                            }
                        }
                    }
                    if (x + 1 < width && y + 1 < height && y - 1 > 0) {
                        if (cells[x + 1][y].type == "floor" && cells[x + 1][y - 1].type == "floor" && cells[x + 1][y + 1].type == "floor") {
                            if (cells[x][y + 1].type == "wall" && cells[x][y - 1].type == "wall") {
                                cells[x][y].type = "door";
                            }
                        }
                    }
                    if (y + 1 < height && x + 1 < width && x - 1 > 0) {
                        if (cells[x][y + 1].type == "floor" && cells[x + 1][y + 1].type == "floor" && cells[x - 1][y + 1].type == "floor") {
                            if (cells[x - 1][y].type == "wall" && cells[x + 1][y].type == "wall") {
                                cells[x][y].type = "door";
                            }
                        }
                    }
                    if (x - 1 > 0 && y + 1 < height && y - 1 > 0) {
                        if (cells[x - 1][y].type == "floor" && cells[x - 1][y - 1].type == "floor" && cells[x - 1][y + 1].type == "floor") {
                            if (cells[x][y + 1].type == "wall" && cells[x][y - 1].type == "wall") {
                                cells[x][y].type = "door";
                            }
                        }
                    }
                }
            }
        }
    }
}
createRooms(20, 5, 15, true, 0.5);

function Player(x, y) {
    this.x = x;
    this.y = y;
    this.move = function (direction) {
        switch (direction) {
            case "north":
                this.y--;
                break;
            case "east":
                this.x++;
                break;
            case "south":
                this.y++;
                break;
            case "west":
                this.x--;
                break;
        }
        //if (cells[this.x][this.y].room != null) {
        //    cells[this.x][this.y].room.discovered = true;
        //}
    }
}
var player = new Player(10, 10);

document.addEventListener("keydown", onKeyDown);
function onKeyDown(e) {
    if (e.keyCode == 38) {
        player.move("north");
    }
    if (e.keyCode == 39) {
        player.move("east");
    }
    if (e.keyCode == 40) {
        player.move("south");
    }
    if (e.keyCode == 37) {
        player.move("west");
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            ctx.fillStyle = "#fff";
            if (x == player.x && y == player.y) {
                ctx.fillText("P", x * fontSize, y * fontSize);
                continue;
            }
            switch (cells[x][y].type) {
                case "empty":
                    ctx.fillText("", x * fontSize, y * fontSize);
                    break;
                case "floor":
                    //if (cells[x][y].room !== null && cells[x][y].room.discovered) {
                    //    ctx.fillText(rooms.indexOf(cells[x][y].room).toString(), x * fontSize, y * fontSize);
                    //}
                    //else {
                    //    ctx.fillText("-", x * fontSize, y * fontSize);
                    //}
                    ctx.fillText("-", x * fontSize, y * fontSize);
                    break;
                case "wall":
                    ctx.fillText("+", x * fontSize, y * fontSize);
                    break;
                case "door":
                    ctx.fillText("#", x * fontSize, y * fontSize);
                    break;
            }
        }
    }
}
setInterval(draw, 100);