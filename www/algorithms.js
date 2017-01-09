// sends out a ray in a certain direction, calling the action on every cell it comes across
// with this implementation, some cells will be visited multiple times
function raycast(sx, sy, r, dir, action) {
    var dx = Math.cos(dir * (Math.PI / 180));
    var dy = Math.sin(dir * (Math.PI / 180));
    var cx = sx + 0.5;
    var cy = sy + 0.5;
    for (var i = 0; i < r; i++) {
        var x = Math.trunc(cx);
        var y = Math.trunc(cy);
        if (x < 0 || x >= getCurrentDungeon().width || y < 0 || y >= getCurrentDungeon().height) {
            return;
        }
        action(x, y);
        var blocked = false;
        switch (getCurrentDungeon().cells[x][y].type) {
            case "wall":
            case "doorClosed":
                blocked = true;
                break;
        }
        if (blocked) {
            return;
        }
        cx += dx;
        cy += dy;
    }
}

// uses A* to find a path between two coordinates
function pathfind(x1, y1, x2, y2, isPlayer) {
    var closedSet = [];
    var openSet = [
        getCurrentDungeon().cells[x1][y1]
    ];
    var cameFrom = [];
    var gScore = [];
    for (var x = 0; x < getCurrentDungeon().width; x++) {
        for (var y = 0; y < getCurrentDungeon().height; y++) {
            mapSet(gScore, getCurrentDungeon().cells[x][y], Infinity);
        }
    }
    mapSet(gScore, getCurrentDungeon().cells[x1][y1], 0);
    var fScore = [];
    for (var x = 0; x < getCurrentDungeon().width; x++) {
        for (var y = 0; y < getCurrentDungeon().height; y++) {
            mapSet(fScore, getCurrentDungeon().cells[x][y], Infinity);
        }
    }
    mapSet(fScore, getCurrentDungeon().cells[x1][y1], distanceBetween(x1, y1, x2, y2));
    while (openSet.length > 0) {
        var current;
        var lowestFScore = Infinity;
        for (var i = 0; i < openSet.length; i++) {
            var value = mapGet(fScore, openSet[i]);
            if (value < lowestFScore) {
                current = openSet[i];
                lowestFScore = value;
            }
        }
        if (current == getCurrentDungeon().cells[x2][y2]) {
            var path = [
                current
            ];
            while (mapGet(cameFrom, current) != null) {
                current = mapGet(cameFrom, current);
                path.push(current);
            }
            path.pop();
            return path;
        }
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);
        var neighbors = [];
        if (current.y - 1 >= 0) {
            var neighbor = getCurrentDungeon().cells[current.x][current.y - 1];
            neighbors.push(neighbor);
        }
        if (current.x + 1 < getCurrentDungeon().width) {
            var neighbor = getCurrentDungeon().cells[current.x + 1][current.y];
            neighbors.push(neighbor);
        }
        if (current.y + 1 < getCurrentDungeon().height) {
            var neighbor = getCurrentDungeon().cells[current.x][current.y + 1];
            neighbors.push(neighbor);
        }
        if (current.x - 1 >= 0) {
            var neighbor = getCurrentDungeon().cells[current.x - 1][current.y];
            neighbors.push(neighbor);
        }
        for (var i = 0; i < neighbors.length; i++) {
            var blocked = false;
            if (isPlayer) {
                switch (neighbors[i].type) {
                    case "wall":
                        blocked = true;
                        break;
                }
            } else {
                switch (neighbors[i].type) {
                    case "wall":
                    case "stairsUp":
                    case "stairsDown":
                        blocked = true;
                        break;
                }
                for (var j = 0; j < getCurrentDungeon().creatures.length; j++) {
                    if (neighbors[i].x == getCurrentDungeon().creatures[j].x && neighbors[i].y == getCurrentDungeon().creatures[j].y) {
                        blocked = true;
                        break;
                    }
                }
                for (var j = 0; j < getCurrentDungeon().chests.length; j++) {
                    if (neighbors[i].x == getCurrentDungeon().chests[j].x && neighbors[i].y == getCurrentDungeon().chests[j].y) {
                        blocked = true;
                        break;
                    }
                }
            }
            if (blocked) {
                neighbors.splice(i, 1);
            }
        }
        for (var i = 0; i < neighbors.length; i++) {
            if (arrayContains(closedSet, neighbors[i])) {
                continue;
            }
            var tentativeGScore = mapGet(gScore, current) + distanceBetween(current.x, current.y, neighbors[i].x, neighbors[i].y);
            if (!arrayContains(openSet, neighbors[i])) {
                openSet.push(neighbors[i]);
            } else if (tentativeGScore >= mapGet(gScore, neighbors[i])) {
                continue;
            }
            mapSet(cameFrom, neighbors[i], current);
            mapSet(gScore, neighbors[i], tentativeGScore);
            mapSet(fScore, neighbors[i], mapGet(gScore, neighbors[i]) + distanceBetween(neighbors[i].x, neighbors[i].y, x2, y2));
        }
    }
    return null;
}