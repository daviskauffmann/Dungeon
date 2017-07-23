import { config, game } from "./game";
import { distanceBetweenSquared, toRadians } from "./math";
import { Area, CellType, Coord } from "./types";

export function aStar(area: Area, start: Coord, goal: Coord) {
    const coords: Coord[][] = [];
    for (let x = 0; x < area.width; x++) {
        coords[x] = [];
        for (let y = 0; y < area.height; y++) {
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
    for (let x = 0; x < area.width; x++) {
        for (let y = 0; y < area.height; y++) {
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
        if (current.x + 1 < area.width) {
            neighbors.push(coords[current.x + 1][current.y]);
        }
        if (current.y + 1 < area.height) {
            neighbors.push(coords[current.x][current.y + 1]);
        }
        if (current.x - 1 >= 0) {
            neighbors.push(coords[current.x - 1][current.y]);
        }

        neighbors.filter((neighbor) => !config.cellInfo[CellType[area.cells[neighbor.x][neighbor.y].type]].solid
            && !area.actors.some((actor) => actor.x === neighbor.x && actor.y === neighbor.y
                && actor.x !== goal.x && actor.y !== goal.y)
            && !area.chests.some((chest) => chest.x === neighbor.x && chest.y === neighbor.y
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

export function fieldOfView(area: Area, origin: Coord, accuracy: number, range: number) {
    const coords: Coord[] = [];

    for (let degrees = 0; degrees < 360; degrees += accuracy) {
        coords.push(...lineOfSight(area, origin, toRadians(degrees), range)
            .filter((coord) => !coords.some((c) => c.x === coord.x && c.y === coord.y)));
    }

    return coords;
}

export function lineOfSight(area: Area, origin: Coord, radians: number, range: number) {
    const coords: Coord[] = [];

    const dx = Math.cos(radians);
    const dy = Math.sin(radians);

    let x = origin.x + 0.5;
    let y = origin.y + 0.5;

    for (let i = 0; i < range; i++) {
        const current: Coord = {
            x: Math.trunc(x),
            y: Math.trunc(y),
        };

        if (current.x >= 0 && current.x < area.width && current.y >= 0 && current.y < area.height) {
            if (!coords.some((coord) => coord.x === current.x && coord.y === current.y)) {
                coords.push(current);
            }

            if (config.cellInfo[CellType[area.cells[current.x][current.y].type]].solid) {
                break;
            }

            x += dx;
            y += dy;
        }
    }

    return coords;
}
