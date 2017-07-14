import { Dungeon, Cell, CellType } from './dungeon';
import { game } from './game';
import { Coord, distanceBetweenSquared } from './math';

export function fov(dungeon: Dungeon, origin: Coord, range: number, accuracy: number) {
    const coords: Array<Coord> = [];

    for (let dir = 0; dir < 360; dir += accuracy) {
        const dx = Math.cos(dir * (Math.PI / 180));
        const dy = Math.sin(dir * (Math.PI / 180));

        const current: Coord = {
            x: origin.x + 0.5,
            y: origin.y + 0.5
        }

        for (let i = 0; i < range; i++) {
            const coord: Coord = {
                x: Math.trunc(current.x),
                y: Math.trunc(current.y)
            }

            if (coord.x >= 0 && coord.x < dungeon.width && coord.y >= 0 && coord.y < dungeon.height) {
                if (!coords.find(c => c.x === coord.x && c.y === coord.y)) {
                    coords.push(coord);
                }

                if (game.cells[dungeon.cells[coord.x][coord.y].type].solid) {
                    break;
                }

                current.x += dx;
                current.y += dy;
            }
        }
    }

    return coords;
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

            if (value < lowestFScore) {
                current = openSet[i];
                lowestFScore = value;
            }
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
            return !game.cells[dungeon.cells[neighbor.x][neighbor.y].type].solid
                && !dungeon.entities.some(entity => {
                    return entity.x === neighbor.x && entity.y === neighbor.y
                        && entity.x !== goal.x && entity.y !== goal.y;
                })
                && !dungeon.chests.some(chest => {
                    return chest.x === neighbor.x && chest.y === neighbor.y
                        && chest.x !== goal.x && chest.y !== goal.y;
                });
        }).forEach(neighbor => {
            if (closedSet.indexOf(neighbor) === -1) {
                if (openSet.indexOf(neighbor) === -1) {
                    openSet.push(neighbor);
                }

                const tentativeGScore = gScore.get(current) + distanceBetweenSquared(current, neighbor);

                if (tentativeGScore < gScore.get(neighbor)) {
                    if (current.x !== start.x || current.y !== start.y) {
                        cameFrom.set(neighbor, current);
                    }

                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, gScore.get(neighbor) + distanceBetweenSquared(neighbor, goal));
                }
            }
        });

        passes++;
    }

    return undefined;
}
