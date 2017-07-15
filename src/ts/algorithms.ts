import { game } from './game';
import { distanceBetweenSquared, toRadians } from './math';
import { Coord, Dungeon } from './types';

export function aStar(dungeon: Dungeon, start: Coord, goal: Coord) {
    const coords: Coord[][] = [];
    for (let x = 0; x < dungeon.width; x++) {
        coords[x] = [];
        for (let y = 0; y < dungeon.height; y++) {
            coords[x][y] = { x, y };
        }
    }

    const closedSet: Coord[] = [];
    const openSet = [
        coords[start.x][start.y],
    ];

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
            const path = [
                current,
            ];

            while (cameFrom.get(current)) {
                current = cameFrom.get(current);
                path.push(current);
            }

            return path;
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        const neighbors: Coord[] = [];
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

        neighbors.filter((neighbor) => !game.cellInfo[dungeon.cells[neighbor.x][neighbor.y].type].solid
            && !dungeon.entities.some((entity) => entity.x === neighbor.x && entity.y === neighbor.y
                && entity.x !== goal.x && entity.y !== goal.y)
            && !dungeon.chests.some((chest) => chest.x === neighbor.x && chest.y === neighbor.y
                && chest.x !== goal.x && chest.y !== goal.y))
            .forEach((neighbor) => {
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

export function fieldOfView(dungeon: Dungeon, origin: Coord, range: number, accuracy: number) {
    const coords: Coord[] = [];

    for (let degrees = 0; degrees < 360; degrees += accuracy) {
        coords.push(...lineOfSight(dungeon, origin, range, toRadians(degrees)).filter((coord) => {
            return !coords.some((c) => c.x === coord.x && c.y === coord.y);
        }));
    }

    return coords;
}

export function lineOfSight(dungeon: Dungeon, origin: Coord, range: number, radians: number) {
    const coords: Coord[] = [];

    const dx = Math.cos(radians);
    const dy = Math.sin(radians);

    const current: Coord = {
        x: origin.x + 0.5,
        y: origin.y + 0.5,
    };

    for (let i = 0; i < range; i++) {
        const coord: Coord = {
            x: Math.trunc(current.x),
            y: Math.trunc(current.y),
        };

        if (coord.x >= 0 && coord.x < dungeon.width
            && coord.y >= 0 && coord.y < dungeon.height) {
            if (!coords.some((c) => c.x === coord.x && c.y === coord.y)) {
                coords.push(coord);
            }

            if (game.cellInfo[dungeon.cells[coord.x][coord.y].type].solid) {
                break;
            }

            current.x += dx;
            current.y += dy;
        }
    }

    return coords;
}
