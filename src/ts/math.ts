export interface Coord {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Rect extends Coord, Size { }

export function randomFloat(min?: number, max?: number) {
    return Math.random() * (max - min) + min
}

export function randomInt(min: number, max: number) {
    return Math.floor(randomFloat(Math.ceil(min), Math.floor(max)));
}

export function distanceBetweenSquared(coord1: Coord, coord2: Coord) {
    return Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2);
}

export function distanceBetween(coord1: Coord, coord2: Coord) {
    return Math.sqrt(distanceBetweenSquared(coord1, coord2));
}

export function isInside(coord: Coord, rect: Rect) {
    return Math.min(rect.x, rect.x + rect.width) <= coord.x
        && coord.x < Math.max(rect.x, rect.x + rect.width)
        && Math.min(rect.y, rect.y + rect.height) <= coord.y
        && coord.y < Math.max(rect.y, rect.y + rect.height);
}
