import { Dungeon, Cell, CellType } from './dungeon';
import { Coord, distanceBetweenSquared } from './math';

interface Hit {
    coord: Coord;
    cell: Cell;
    data?: any;
}

export function fov(
    dungeon: Dungeon,
    origin: Coord,
    r: number,
    accuracy: number,
    blockedBy: Array<CellType>,
    action: (coord: Coord) => any) {

    const hits: Array<Hit> = [];

    for (let dir = 0; dir < 360; dir += accuracy) {
        const hit = (() => {
            const dx = Math.cos(dir * (Math.PI / 180));
            const dy = Math.sin(dir * (Math.PI / 180));

            const current: Coord = {
                x: origin.x + 0.5,
                y: origin.y + 0.5
            }

            for (let i = 0; i < r; i++) {
                const coord: Coord = {
                    x: Math.trunc(current.x),
                    y: Math.trunc(current.y)
                }

                if (coord.x < 0 || coord.x >= dungeon.width || coord.y < 0 || coord.y >= dungeon.height) {
                    return;
                }

                const hit: Hit = {
                    coord: coord,
                    cell: dungeon.cells[coord.x][coord.y],
                };

                const data = action(coord);
                if (data) {
                    hit.data = data;

                    return hit;
                }

                if (blockedBy.indexOf(dungeon.cells[coord.x][coord.y].type) > -1) {
                    return hit;
                }

                current.x += dx;
                current.y += dy;
            }
        })();

        if (!hit) {
            continue;
        }

        if (hits.find(h => h.cell === hit.cell)) {
            continue;
        }

        hits.push(hit);
    }

    return hits;
}

export function astar(dungeon: Dungeon, start: Coord, goal: Coord) {
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
    const openSet = [coords[start.x][start.y]];

    const cameFrom = new Map<Coord, Coord>();
    const gScore = new Map<Coord, number>();
    const fScore = new Map<Coord, number>();
    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            gScore.set(coords[x][y], Infinity);
            fScore.set(coords[x][y], Infinity);
        }
    }
    gScore.set(coords[start.x][start.y], 0);
    fScore.set(coords[start.x][start.y], distanceBetweenSquared(start, goal));

    let passes = 0;
    while (openSet.length > 0) {
        let current: Coord;
        let lowestFScore = Infinity;

        for (let i = 0; i < openSet.length; i++) {
            const value = fScore.get(openSet[i]);

            if (value >= lowestFScore) {
                continue;
            }

            current = openSet[i];
            lowestFScore = value;
        }

        if (current === coords[goal.x][goal.y] || passes > Infinity) {
            const path = [current];

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
                case CellType.Empty:
                case CellType.Wall:
                    return false;
            }

            if (dungeon.entities.some(entity => {
                if (entity.x !== neighbor.x || entity.y !== neighbor.y) {
                    return false;
                }

                if (entity.x === goal.x && entity.y === goal.y) {
                    return false;
                }

                return true;
            }) || dungeon.chests.some(chest => {
                if (chest.x !== neighbor.x || chest.y !== neighbor.y) {
                    return false;
                }

                if (chest.x === goal.x && chest.y === goal.y) {
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

            const tentativeGScore = gScore.get(current) + distanceBetweenSquared(current, neighbor);
            if (openSet.indexOf(neighbor) === -1) {
                openSet.push(neighbor);
            } else if (tentativeGScore >= gScore.get(neighbor)) {
                return;
            }

            if (current.x !== start.x || current.y !== start.y) {
                cameFrom.set(neighbor, current);
            }

            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, gScore.get(neighbor) + distanceBetweenSquared(neighbor, goal))
        });

        passes++;
    }

    return undefined;
}
