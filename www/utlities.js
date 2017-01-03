function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    //return 4;
    return Math.floor(Math.random() * (max - min)) + min;
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function arrayContains(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == element) {
            return true;
        }
    }
    return false;
}

function mapGet(map, key) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].key == key) {
            return map[i].value;
        }
    }
    return null;
}

function mapSet(map, key, value) {
    for (var i = 0; i < map.length; i++) {
        if (map[i].key == key) {
            map[i].value = value;
            return;
        }
    }
    map.push({
        key: key,
        value: value
    });
}