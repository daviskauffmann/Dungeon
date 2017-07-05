function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //return 4;
    return Math.floor(Math.random() * (max - min)) + min;
}

function distanceBetweenSquared(coord1: Coord, coord2: Coord): number {
    return Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2);
}

function distanceBetween(coord1: Coord, coord2: Coord) {
    return Math.sqrt(distanceBetweenSquared(coord1, coord2));
}

function isInside(coord: Coord, rect: Rect) {
    return Math.min(rect.x, rect.x + rect.width) <= coord.x &&
        coord.x <= Math.max(rect.x, rect.x + rect.width) &&
        Math.min(rect.y, rect.y + rect.height) <= coord.y &&
        coord.y <= Math.max(rect.y, rect.y + rect.height);
}
