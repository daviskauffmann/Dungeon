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
        coord.x < Math.max(rect.x, rect.x + rect.width) &&
        Math.min(rect.y, rect.y + rect.height) <= coord.y &&
        coord.y < Math.max(rect.y, rect.y + rect.height);
}

function getDungeon(entity: Entity) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.indexOf(entity) > -1;
    });
}

function getLevel(entity: Entity) {
    return game.dungeons.indexOf(getDungeon(entity));
}

function getEntity(id: number) {
    return game.dungeons.find(dungeon => {
        return dungeon.entities.some(entity => {
            return entity.id === id;
        });
    }).entities.find(entity => {
        return entity.id === id;
    });
}

function getInventoryIndex(entity: Entity, item: Item) {
    return String.fromCharCode(97 + entity.inventory.indexOf(item));
}

function addMessage(message: string) {
    game.messages.push(message);

    if (game.messages.length > ui.maxMessages) {
        game.messages.shift();
    }
}
