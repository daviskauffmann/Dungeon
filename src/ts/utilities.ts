function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //return 4;
    return Math.floor(Math.random() * (max - min)) + min;
}

function distanceBetween(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function distanceBetweenSquared(x1: number, y1: number, x2: number, y2: number): number {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}
