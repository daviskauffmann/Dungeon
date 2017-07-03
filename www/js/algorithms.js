// sends out a ray in a certain direction, calling the action on every cell it comes across
// blockedBy is an array of cell types that block the ray
// action() is a function that will stop the ray if it returns true
// raycast() will then return the cell where action() stopped, returning nothing otherwise
// with this implementation, some cells will be visited multiple times
function raycast(dungeon, sx, sy, r, dir, blockedBy, action) {
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
            return dungeon.cells[x][y];
        }

        if (blockedBy.indexOf(dungeon.cells[x][y].type) > -1) {
            return;
        }

        cx += dx;
        cy += dy;
    }
}

// sends out rays in a circle
// returns an array of cells that were affected by action()
function spherecast(dungeon, sx, sy, r, accuracy, blockedBy, action) {
    var cells = [];
    for (var dir = 0; dir < 360; dir += accuracy) {
        var cell = raycast(dungeon, sx, sy, r, dir, blockedBy, action);
        if (cell && cells.indexOf(cell) === -1) {
            cells.push(cell);
        }
    }
    return cells;
}

// uses A* to find a path between two coordinates
// returns an array of coordinates leading from the start position to the end position, or undefined if no path was found
function pathfind(dungeon, x1, y1, x2, y2) {
    var coords = [];
    for (var x = 0; x < dungeon.width; x++) {
        coords[x] = [];
        for (var y = 0; y < dungeon.height; y++) {
            coords[x][y] = {
                x: x,
                y: y
            }
        }
    }

    var closedSet = [];
    var openSet = [
        coords[x1][y1]
    ];

    var cameFrom = new Map();
    var gScore = new Map();
    var fScore = new Map();
    for (var x = 0; x < dungeon.width; x++) {
        for (var y = 0; y < dungeon.height; y++) {
            gScore.set(coords[x][y], Infinity);
            fScore.set(coords[x][y], Infinity);
        }
    }
    gScore.set(coords[x1][y1], 0);
    fScore.set(coords[x1][y1], distanceBetweenSquared(x1, y1, x2, y2));

    var passes = 0;
    while (openSet.length > 0) {
        var current;
        var lowestFScore = Infinity;

        for (var i = 0; i < openSet.length; i++) {
            var value = fScore.get(openSet[i]);
            if (value < lowestFScore) {
                current = openSet[i];
                lowestFScore = value;
            }
        }

        if (current === coords[x2][y2] || passes > Infinity) {
            var path = [
                current
            ];
            while (cameFrom.get(current)) {
                current = cameFrom.get(current);
                path.push(current);
            }
            return path;
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        var neighbors = [];
        if (current.y - 1 >= 0) {
            neighbors.push(coords[current.x][current.y - 1]);
        }
        if (current.x + 1 < dungeon.width) {
            neighbors.push(coords[current.x + 1][current.y]);
        }
        if (current.y + 1 < dungeon.height) {
            neighbors.push(coords[current.x][current.y + 1]);
        }
        if (current.x - 1 >= 0) {
            neighbors.push(coords[current.x - 1][current.y]);
        }

        neighbors = neighbors.filter(neighbor => {
            switch (dungeon.cells[neighbor.x][neighbor.y].type) {
                case 'empty':
                case 'wall':
                    return false;
            }

            if (dungeon.entities.some(entity => {
                if (entity.x !== neighbor.x || entity.y !== neighbor.y) {
                    return false;
                }

                if (entity.x === x2 && entity.y === y2) {
                    return false;
                }

                return true;
            }) || dungeon.chests.some(chest => {
                if (chest.x !== neighbor.x || chest.y !== neighbor.y) {
                    return false;
                }

                if (chest.x === x2 && chest.y === y2) {
                    return false;
                }

                return true;
            })) {
                return false;
            }

            return true;
        });

        for (var i = 0; i < neighbors.length; i++) {
            if (closedSet.indexOf(neighbors[i]) > -1) {
                continue;
            }

            var tentativeGScore = gScore.get(current) + distanceBetweenSquared(current.x, current.y, neighbors[i].x, neighbors[i].y);
            if (openSet.indexOf(neighbors[i]) === -1) {
                openSet.push(neighbors[i]);
            } else if (tentativeGScore >= gScore.get(neighbors[i])) {
                continue;
            }

            if (current.x !== x1 || current.y !== y1) {
                cameFrom.set(neighbors[i], current);
            }

            gScore.set(neighbors[i], tentativeGScore);
            fScore.set(neighbors[i], gScore.get(neighbors[i]) + distanceBetweenSquared(neighbors[i].x, neighbors[i].y, x2, y2))
        }

        passes++;
    }

    return undefined;
}
