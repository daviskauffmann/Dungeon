import { Coord, Rect } from "./types";

export function degreesBetween(coord1: Coord, coord2: Coord) {
    return toDegrees(radiansBetween(coord1, coord2));
}

export function distanceBetween(coord1: Coord, coord2: Coord) {
    return Math.sqrt(distanceBetweenSquared(coord1, coord2));
}

export function distanceBetweenSquared(coord1: Coord, coord2: Coord) {
    return Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2);
}

export function isInside(coord: Coord, rect: Rect) {
    return Math.min(rect.left, rect.left + rect.width) <= coord.x
        && coord.x < Math.max(rect.left, rect.left + rect.width)
        && Math.min(rect.top, rect.top + rect.height) <= coord.y
        && coord.y < Math.max(rect.top, rect.top + rect.height);
}

export function radiansBetween(coord1: Coord, coord2: Coord) {
    return Math.atan2(coord2.y - coord1.y, coord2.x - coord1.x);
}

export function randomFloat(min?: number, max?: number) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
    return Math.floor(randomFloat(Math.ceil(min), Math.floor(max)));
}

export function toDegrees(radians: number) {
    return radians * 180 / Math.PI;
}

export function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}
