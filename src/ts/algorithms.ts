/// <reference path="main.ts" />

// sends out a ray in a certain direction, calling the action on every cell it comes across
// blockedBy is an array of cell types that block the ray
// action() is a function that will stop the ray if it returns true
// raycast() will then return the cell where action() stopped, returning nothing otherwise
// with this implementation, some cells will be visited multiple times
function raycast(dungeon: Dungeon,
                 sx: number,
                 sy: number,
                 r: number,
                 dir: number,
                 blockedBy: Array<string>,
                 action: (x: number, y: number) => boolean | void) {
    const dx = Math.cos(dir * (Math.PI / 180));
    const dy = Math.sin(dir * (Math.PI / 180));

    let cx = sx + 0.5;
    let cy = sy + 0.5;

    for (let i = 0; i < r; i++) {
        const x = Math.trunc(cx);
        const y = Math.trunc(cy);

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
function spherecast(dungeon: Dungeon,
                    sx: number,
                    sy: number,
                    r: number,
                    accuracy: number,
                    blockedBy: Array<string>,
                    action: (x: number, y: number) => boolean | void) {
    const cells: Array<Cell> = [];
    for (let dir = 0; dir < 360; dir += accuracy) {
        const cell = raycast(dungeon, sx, sy, r, dir, blockedBy, action);
        if (cell && cells.indexOf(cell) === -1) {
            cells.push(cell);
        }
    }
    return cells;
}

// uses A* to find a path between two coordinates
// returns an array of coordinates leading from the start position to the end position, or undefined if no path was found
function pathfind(dungeon: Dungeon,
                  x1: number,
                  y1: number,
                  x2: number,
                  y2: number) {
    const coords: Array<Array<Coord>> = [];
    for (let x = 0; x < dungeon.width; x++) {
        coords[x] = [];
        for (let y = 0; y < dungeon.height; y++) {
            coords[x][y] = {
                x: x,
                y: y
            }
        }
    }

    const closedSet: Array<Coord> = [];
    const openSet = [ coords[x1][y1] ];

    const cameFrom = new Map<Coord, Coord>();
    const gScore = new Map<Coord, number>();
    const fScore = new Map<Coord, number>();
    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            gScore.set(coords[x][y], Infinity);
            fScore.set(coords[x][y], Infinity);
        }
    }
    gScore.set(coords[x1][y1], 0);
    fScore.set(coords[x1][y1], distanceBetweenSquared(x1, y1, x2, y2));

    let passes = 0;
    while (openSet.length > 0) {
        let current: Coord;
        let lowestFScore = Infinity;

        for (let i = 0; i < openSet.length; i++) {
            const value = fScore.get(openSet[i]);
            if (value < lowestFScore) {
                current = openSet[i];
                lowestFScore = value;
            }
        }

        if (current === coords[x2][y2] || passes > Infinity) {
            const path = [
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

        const neighbors: Array<Coord> = [];
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

        neighbors.filter(neighbor => {
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
        }).forEach(neighbor => {
            if (closedSet.indexOf(neighbor) > -1) {
                return;
            }

            const tentativeGScore = gScore.get(current) + distanceBetweenSquared(current.x, current.y, neighbor.x, neighbor.y);
            if (openSet.indexOf(neighbor) === -1) {
                openSet.push(neighbor);
            } else if (tentativeGScore >= gScore.get(neighbor)) {
                return;
            }

            if (current.x !== x1 || current.y !== y1) {
                cameFrom.set(neighbor, current);
            }

            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, gScore.get(neighbor) + distanceBetweenSquared(neighbor.x, neighbor.y, x2, y2))
        });

        passes++;
    }

    return undefined;
}
