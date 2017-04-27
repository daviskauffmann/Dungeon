// sends out a ray in a certain direction, calling the action on every cell it comes across
// action() is a function that will stop the ray if it returns true
// raycast() will then return the cell where action() stopped, returning null otherwise
// with this implementation, some cells will be visited multiple times
function raycast(dungeon, sx, sy, r, dir, action) {
	var dx = Math.cos(dir * (Math.PI / 180));
	var dy = Math.sin(dir * (Math.PI / 180));
	var cx = sx + 0.5;
	var cy = sy + 0.5;
	for (var i = 0; i < r; i++) {
		var x = Math.trunc(cx);
		var y = Math.trunc(cy);
		if (x < 0 || x >= dungeon.width || y < 0 || y >= dungeon.height) {
			return;
		}
		if (action(x, y)) {
			return dungeon.cells[x][y];
		}
		var blocked = false;
		switch (dungeon.cells[x][y].type) {
			case "wall":
			case "doorClosed":
				blocked = true;
				break;
		}
		if (blocked) {
			return;
		}
		cx += dx;
		cy += dy;
	}
}

function spherecast(dungeon, sx, sy, r, accuracy, action) {
	var cells = [];
	for (var dir = 0; dir < 360; dir += accuracy) {
		var cell = raycast(dungeon, sx, sy, r, dir, action);
		if (cell) {
			cells.push(cell);
		}
	}
	return cells;
}

// uses A* to find a path between two coordinates
// returns an array of coordinates leading from the start position to the end position, or null if no path was found
function pathfind(dungeon, x1, y1, x2, y2) {
	var coords = [];
	for (var x = 0; x < dungeon.width; x++) {
		coords[x] = [];
		for (var y = 0; y < dungeon.height; y++) {
			coords[x][y] = {
				x: x,
				y: y
			}
		}
	}
	var closedSet = [];
	var openSet = [
		coords[x1][y1]
	];
	var cameFrom = [];
	var gScore = [];
	var fScore = [];
	for (var x = 0; x < dungeon.width; x++) {
		for (var y = 0; y < dungeon.height; y++) {
			mapSet(gScore, coords[x][y], Infinity);
			mapSet(fScore, coords[x][y], Infinity);
		}
	}
	mapSet(gScore, coords[x1][y1], 0);
	mapSet(fScore, coords[x1][y1], distanceBetween(x1, y1, x2, y2));
	var passes = 0;
	while (openSet.length > 0) {
		var current;
		var lowestFScore = Infinity;
		for (var i = 0; i < openSet.length; i++) {
			var value = mapGet(fScore, openSet[i]);
			if (value < lowestFScore) {
				current = openSet[i];
				lowestFScore = value;
			}
		}
		if (current == coords[x2][y2] || passes > Infinity) {
			var path = [
				current
			];
			while (mapGet(cameFrom, current) != null) {
				current = mapGet(cameFrom, current);
				path.push(current);
			}
			return path;
		}
		openSet.splice(openSet.indexOf(current), 1);
		closedSet.push(current);
		var neighbors = [];
		if (current.y - 1 >= 0) {
			var neighbor = coords[current.x][current.y - 1];
			neighbors.push(neighbor);
		}
		if (current.x + 1 < dungeon.width) {
			var neighbor = coords[current.x + 1][current.y];
			neighbors.push(neighbor);
		}
		if (current.y + 1 < dungeon.height) {
			var neighbor = coords[current.x][current.y + 1];
			neighbors.push(neighbor);
		}
		if (current.x - 1 >= 0) {
			var neighbor = coords[current.x - 1][current.y];
			neighbors.push(neighbor);
		}
		for (var i = 0; i < neighbors.length; i++) {
			var blocked = false;
			switch (dungeon.cells[neighbors[i].x][neighbors[i].y].type) {
				case "empty":
				case "wall":
					blocked = true;
					break;
			}
			for (var j = 0; j < dungeon.entities.length; j++) {
				if (dungeon.entities[j].x == x2 && dungeon.entities[j].y == y2) {
					continue;
				}
				if (dungeon.entities[j].x == neighbors[i].x && dungeon.entities[j].y == neighbors[i].y) {
					blocked = true;
					break;
				}
			}
			for (var j = 0; j < dungeon.chests.length; j++) {
				if (dungeon.chests[j].x == x2 && dungeon.chests[j].y == y2) {
					continue;
				}
				if (dungeon.chests[j].x == neighbors[i].x && dungeon.chests[j].y == neighbors[i].y) {
					blocked = true;
					break;
				}
			}
			if (blocked) {
				neighbors.splice(i, 1);
			}
		}
		for (var i = 0; i < neighbors.length; i++) {
			if (arrayContains(closedSet, neighbors[i])) {
				continue;
			}
			var tentativeGScore = mapGet(gScore, current) + distanceBetween(current.x, current.y, neighbors[i].x, neighbors[i].y);
			if (!arrayContains(openSet, neighbors[i])) {
				openSet.push(neighbors[i]);
			} else if (tentativeGScore >= mapGet(gScore, neighbors[i])) {
				continue;
			}
			if (current.x != x1 || current.y != y1) {
				mapSet(cameFrom, neighbors[i], current);
			}
			mapSet(gScore, neighbors[i], tentativeGScore);
			mapSet(fScore, neighbors[i], mapGet(gScore, neighbors[i]) + distanceBetween(neighbors[i].x, neighbors[i].y, x2, y2));
		}
		passes++;
	}
	return null;
}