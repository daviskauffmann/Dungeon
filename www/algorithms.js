// sends out a ray in a certain direction, calling the action on every cell it comes across
// action() is a function that will stop the ray if it returns true
// raycast() will then return the coordinates of where action() stopped, returning null otherwise
// with this implementation, some cells will be visited multiple times
function raycast(dungeon, sx, sy, r, dir, action) {
    var dx = Math.cos(dir * (Math.PI / 180));
    var dy = Math.sin(dir * (Math.PI / 180));
    var cx = sx + 0.5;
    var cy = sy + 0.5;
    for (var i = 0; i < r; i++) {
        var x = Math.trunc(cx);
        var y = Math.trunc(cy);
        if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
            return;
        }
        if (action(x, y)) {
            return {
                x: x,
                y: y
            };
        }
        var blocked = false;
        switch (dungeon.cells[x][y].type) {
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
function pathfind(dungeon, x1, y1, x2, y2) {
    var closedSet = [];
    var openSet = [
        dungeon.cells[x1][y1]
    ];
    var cameFrom = [];
    var gScore = [];
    var fScore = [];
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            mapSet(gScore, dungeon.cells[x][y], Infinity);
            mapSet(fScore, dungeon.cells[x][y], Infinity);
        }
    }
    mapSet(gScore, dungeon.cells[x1][y1], 0);
    mapSet(fScore, dungeon.cells[x1][y1], distanceBetween(x1, y1, x2, y2));
    var passes = 0;
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
        if (current == dungeon.cells[x2][y2] || passes > Infinity) {
            var path = [
                current
            ];
            while (mapGet(cameFrom, current) != null) {
                current = mapGet(cameFrom, current);
                path.push(current);
            }
            path.pop();
            console.log(passes);
            return path;
        }
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);
        var neighbors = [];
        if (current.y - 1 >= 0) {
            var neighbor = dungeon.cells[current.x][current.y - 1];
            neighbors.push(neighbor);
        }
        if (current.x + 1 < dungeon.width) {
            var neighbor = dungeon.cells[current.x + 1][current.y];
            neighbors.push(neighbor);
        }
        if (current.y + 1 < dungeon.height) {
            var neighbor = dungeon.cells[current.x][current.y + 1];
            neighbors.push(neighbor);
        }
        if (current.x - 1 >= 0) {
            var neighbor = dungeon.cells[current.x - 1][current.y];
            neighbors.push(neighbor);
        }
        for (var i = 0; i < neighbors.length; i++) {
            var blocked = false;
            switch (neighbors[i].type) {
                case "empty":
                case "wall":
                    blocked = true;
                    break;
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
        passes++;
    }
    console.log(passes);
    return null;
}