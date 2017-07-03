/// <reference path="main.js" />

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //return 4;
    return Math.floor(Math.random() * (max - min)) + min;
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function distanceBetweenSquared(x1, y1, x2, y2) {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}
