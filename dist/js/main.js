/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return game; });
/* harmony export (immutable) */ __webpack_exports__["c"] = load;
/* harmony export (immutable) */ __webpack_exports__["d"] = log;
/* harmony export (immutable) */ __webpack_exports__["e"] = save;
/* harmony export (immutable) */ __webpack_exports__["f"] = tick;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__actors__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__algorithms__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__math__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils__ = __webpack_require__(4);





const config = {
    actorInfo: [
        {
            char: "@",
            disposition: __WEBPACK_IMPORTED_MODULE_3__types__["d" /* Disposition */].Aggressive,
            factions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Player,
            ],
            hostileFactions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Monster,
            ],
            sight: 5,
        },
        {
            char: "s",
            disposition: __WEBPACK_IMPORTED_MODULE_3__types__["d" /* Disposition */].Aggressive,
            factions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Monster,
            ],
            hostileFactions: [],
            sight: 10,
        },
        {
            char: "r",
            disposition: __WEBPACK_IMPORTED_MODULE_3__types__["d" /* Disposition */].Aggressive,
            factions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Monster,
            ],
            hostileFactions: [],
            sight: 10,
        },
        {
            char: "o",
            disposition: __WEBPACK_IMPORTED_MODULE_3__types__["d" /* Disposition */].Aggressive,
            factions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Monster,
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Orc,
            ],
            hostileFactions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Player,
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Bugbear,
            ],
            sight: 10,
        },
        {
            char: "b",
            disposition: __WEBPACK_IMPORTED_MODULE_3__types__["d" /* Disposition */].Aggressive,
            factions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Monster,
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Bugbear,
            ],
            hostileFactions: [
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Player,
                __WEBPACK_IMPORTED_MODULE_3__types__["e" /* Faction */].Orc,
            ],
            sight: 10,
        },
    ],
    cellInfo: [
        {
            char: " ",
            color: "#ffffff",
            solid: false,
        },
        {
            char: ".",
            color: "#ffffff",
            solid: false,
        },
        {
            char: "^",
            color: "#50ff50",
            solid: false,
        },
        {
            char: "#",
            color: "#ffffff",
            solid: true,
        },
        {
            char: "-",
            color: "#ffffff",
            solid: false,
        },
        {
            char: "+",
            color: "#ffffff",
            solid: true,
        },
    ],
    classInfo: [
        {
            color: "#ffffff",
        },
        {
            color: "#ffffff",
        },
        {
            color: "#ffff00",
        },
    ],
    itemInfo: [
        {
            char: "%",
        },
        {
            char: "|",
        },
        {
            char: "/",
        },
        {
            char: ")",
        },
        {
            char: "}",
        },
    ],
    stairInfo: [
        {
            char: ">",
            color: "#ffffff",
        },
        {
            char: "<",
            color: "#ffffff",
        },
    ],
};
/* harmony export (immutable) */ __webpack_exports__["a"] = config;

let game = {
    currentActorId: 1,
    currentStairId: 0,
    fontSize: 24,
    godMode: true,
    ignoreFov: false,
    messages: [],
    stopTime: false,
    turn: 0,
    world: undefined,
};
function load() {
    game = JSON.parse(localStorage.getItem("game"));
    console.log(game);
}
function log(area, location, message) {
    const playerContext = __WEBPACK_IMPORTED_MODULE_4__utils__["a" /* findActor */](0);
    const player = playerContext.actor;
    if ((area === playerContext.level || area === playerContext.chunk)
        && __WEBPACK_IMPORTED_MODULE_1__algorithms__["c" /* lineOfSight */](area, player, __WEBPACK_IMPORTED_MODULE_2__math__["c" /* radiansBetween */](player, location), config.actorInfo[player.actorType].sight)
            .find((coord) => coord.x === location.x && coord.y === location.y)) {
        game.messages.push(message);
        if (game.messages.length > ui.maxMessages) {
            game.messages.shift();
        }
    }
}
function save() {
    localStorage.setItem("game", JSON.stringify(game));
    console.log(JSON.stringify(game));
}
function tick() {
    if (!game.stopTime) {
        game.world.chunks.forEach((chunks) => {
            chunks.forEach((chunk) => {
                chunk.actors.forEach((actor) => {
                    if (actor.id !== 0) {
                        __WEBPACK_IMPORTED_MODULE_0__actors__["g" /* tick */](actor, chunk);
                    }
                });
                chunk.dungeons.forEach((dungeon) => {
                    dungeon.levels.forEach((level) => {
                        level.actors.forEach((actor) => {
                            if (actor.id !== 0) {
                                __WEBPACK_IMPORTED_MODULE_0__actors__["g" /* tick */](actor, chunk, dungeon, level);
                            }
                        });
                    });
                });
            });
        });
        game.turn++;
    }
}
const ui = {
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    maxMessages: 10,
    mode: __WEBPACK_IMPORTED_MODULE_3__types__["h" /* UIMode */].Default,
    target: { x: 0, y: 0 },
};
/* harmony export (immutable) */ __webpack_exports__["g"] = ui;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export degreesBetween */
/* harmony export (immutable) */ __webpack_exports__["a"] = distanceBetweenSquared;
/* unused harmony export distanceBetween */
/* harmony export (immutable) */ __webpack_exports__["b"] = isInside;
/* harmony export (immutable) */ __webpack_exports__["c"] = radiansBetween;
/* harmony export (immutable) */ __webpack_exports__["d"] = randomFloat;
/* harmony export (immutable) */ __webpack_exports__["e"] = randomInt;
/* unused harmony export toDegrees */
/* harmony export (immutable) */ __webpack_exports__["f"] = toRadians;
function degreesBetween(coord1, coord2) {
    return toDegrees(radiansBetween(coord1, coord2));
}
function distanceBetweenSquared(coord1, coord2) {
    return Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2);
}
function distanceBetween(coord1, coord2) {
    return Math.sqrt(distanceBetweenSquared(coord1, coord2));
}
function isInside(coord, rect) {
    return Math.min(rect.left, rect.left + rect.width) <= coord.x
        && coord.x < Math.max(rect.left, rect.left + rect.width)
        && Math.min(rect.top, rect.top + rect.height) <= coord.y
        && coord.y < Math.max(rect.top, rect.top + rect.height);
}
function radiansBetween(coord1, coord2) {
    return Math.atan2(coord2.y - coord1.y, coord2.x - coord1.x);
}
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
    return Math.floor(randomFloat(Math.ceil(min), Math.floor(max)));
}
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ActorType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return CellType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Class; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return Disposition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return Faction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return ItemType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return StairDirection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return UIMode; });
var ActorType;
(function (ActorType) {
    ActorType[ActorType["Player"] = 0] = "Player";
    ActorType[ActorType["Slime"] = 1] = "Slime";
    ActorType[ActorType["Rat"] = 2] = "Rat";
    ActorType[ActorType["Orc"] = 3] = "Orc";
    ActorType[ActorType["Bugbear"] = 4] = "Bugbear";
})(ActorType || (ActorType = {}));
var CellType;
(function (CellType) {
    CellType[CellType["Empty"] = 0] = "Empty";
    CellType[CellType["Floor"] = 1] = "Floor";
    CellType[CellType["Grass"] = 2] = "Grass";
    CellType[CellType["Wall"] = 3] = "Wall";
    CellType[CellType["DoorOpen"] = 4] = "DoorOpen";
    CellType[CellType["DoorClosed"] = 5] = "DoorClosed";
})(CellType || (CellType = {}));
var Class;
(function (Class) {
    Class[Class["None"] = 0] = "None";
    Class[Class["Warrior"] = 1] = "Warrior";
    Class[Class["Shaman"] = 2] = "Shaman";
})(Class || (Class = {}));
var Disposition;
(function (Disposition) {
    Disposition[Disposition["Passive"] = 0] = "Passive";
    Disposition[Disposition["Aggressive"] = 1] = "Aggressive";
    Disposition[Disposition["Cowardly"] = 2] = "Cowardly";
})(Disposition || (Disposition = {}));
var Faction;
(function (Faction) {
    Faction[Faction["Player"] = 0] = "Player";
    Faction[Faction["Monster"] = 1] = "Monster";
    Faction[Faction["Bugbear"] = 2] = "Bugbear";
    Faction[Faction["Orc"] = 3] = "Orc";
})(Faction || (Faction = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["Corpse"] = 0] = "Corpse";
    ItemType[ItemType["Sword"] = 1] = "Sword";
    ItemType[ItemType["Spear"] = 2] = "Spear";
    ItemType[ItemType["Shield"] = 3] = "Shield";
    ItemType[ItemType["Bow"] = 4] = "Bow";
})(ItemType || (ItemType = {}));
var StairDirection;
(function (StairDirection) {
    StairDirection[StairDirection["Down"] = 0] = "Down";
    StairDirection[StairDirection["Up"] = 1] = "Up";
})(StairDirection || (StairDirection = {}));
var UIMode;
(function (UIMode) {
    UIMode[UIMode["Default"] = 0] = "Default";
    UIMode[UIMode["Target"] = 1] = "Target";
    UIMode[UIMode["Inventory"] = 2] = "Inventory";
    UIMode[UIMode["InventoryDrop"] = 3] = "InventoryDrop";
    UIMode[UIMode["InventoryEquip"] = 4] = "InventoryEquip";
    UIMode[UIMode["InventoryUnequip"] = 5] = "InventoryUnequip";
    UIMode[UIMode["InventorySwapFirst"] = 6] = "InventorySwapFirst";
    UIMode[UIMode["InventorySwapSecond"] = 7] = "InventorySwapSecond";
    UIMode[UIMode["Character"] = 8] = "Character";
})(UIMode || (UIMode = {}));


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = aStar;
/* harmony export (immutable) */ __webpack_exports__["b"] = fieldOfView;
/* harmony export (immutable) */ __webpack_exports__["c"] = lineOfSight;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__math__ = __webpack_require__(1);


function aStar(area, start, goal) {
    const coords = [];
    for (let x = 0; x < area.width; x++) {
        coords[x] = [];
        for (let y = 0; y < area.height; y++) {
            coords[x][y] = { x, y };
        }
    }
    const closedSet = [];
    const openSet = [
        coords[start.x][start.y],
    ];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    for (let x = 0; x < area.width; x++) {
        for (let y = 0; y < area.height; y++) {
            gScore.set(coords[x][y], Infinity);
            fScore.set(coords[x][y], Infinity);
        }
    }
    gScore.set(coords[start.x][start.y], 0);
    fScore.set(coords[start.x][start.y], __WEBPACK_IMPORTED_MODULE_1__math__["a" /* distanceBetweenSquared */](start, goal));
    let passes = 0;
    while (openSet.length > 0) {
        let current;
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
        const neighbors = [];
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
        neighbors.filter((neighbor) => !__WEBPACK_IMPORTED_MODULE_0__game__["a" /* config */].cellInfo[area.cells[neighbor.x][neighbor.y].type].solid
            && !area.actors.some((actor) => actor.x === neighbor.x && actor.y === neighbor.y
                && actor.x !== goal.x && actor.y !== goal.y)
            && !area.chests.some((chest) => chest.x === neighbor.x && chest.y === neighbor.y
                && chest.x !== goal.x && chest.y !== goal.y))
            .forEach((neighbor) => {
            if (closedSet.indexOf(neighbor) === -1) {
                if (openSet.indexOf(neighbor) === -1) {
                    openSet.push(neighbor);
                }
                const tentativeGScore = gScore.get(current) + __WEBPACK_IMPORTED_MODULE_1__math__["a" /* distanceBetweenSquared */](current, neighbor);
                if (tentativeGScore < gScore.get(neighbor)) {
                    if (current.x !== start.x || current.y !== start.y) {
                        cameFrom.set(neighbor, current);
                    }
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, gScore.get(neighbor) + __WEBPACK_IMPORTED_MODULE_1__math__["a" /* distanceBetweenSquared */](neighbor, goal));
                }
            }
        });
        passes++;
    }
    return undefined;
}
function fieldOfView(area, origin, accuracy, range) {
    const coords = [];
    for (let degrees = 0; degrees < 360; degrees += accuracy) {
        coords.push(...lineOfSight(area, origin, __WEBPACK_IMPORTED_MODULE_1__math__["f" /* toRadians */](degrees), range)
            .filter((coord) => !coords.some((c) => c.x === coord.x && c.y === coord.y)));
    }
    return coords;
}
function lineOfSight(area, origin, radians, range) {
    const coords = [];
    const current = {
        x: origin.x + 0.5,
        y: origin.y + 0.5,
    };
    const delta = {
        x: Math.cos(radians),
        y: Math.sin(radians),
    };
    for (let i = 0; i < range; i++) {
        const coord = {
            x: Math.trunc(current.x),
            y: Math.trunc(current.y),
        };
        if (coord.x >= 0 && coord.x < area.width
            && coord.y >= 0 && coord.y < area.height) {
            if (!coords.some((c) => c.x === coord.x && c.y === coord.y)) {
                coords.push(coord);
            }
            if (__WEBPACK_IMPORTED_MODULE_0__game__["a" /* config */].cellInfo[area.cells[coord.x][coord.y].type].solid) {
                break;
            }
            current.x += delta.x;
            current.y += delta.y;
        }
    }
    return coords;
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = findActor;
/* harmony export (immutable) */ __webpack_exports__["b"] = findStair;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__types__ = __webpack_require__(2);


function findActor(id) {
    for (const chunks of __WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].world.chunks) {
        for (const chunk of chunks) {
            for (const actor of chunk.actors) {
                if (actor.id === id) {
                    const actorContext = {
                        actor,
                        chunk,
                    };
                    return actorContext;
                }
            }
            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    for (const actor of level.actors) {
                        if (actor.id === id) {
                            const actorContext = {
                                actor,
                                chunk,
                                dungeon,
                                level,
                            };
                            return actorContext;
                        }
                    }
                }
            }
        }
    }
}
function findStair(id, direction) {
    for (const chunks of __WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].world.chunks) {
        for (const chunk of chunks) {
            if (direction === __WEBPACK_IMPORTED_MODULE_1__types__["g" /* StairDirection */].Down) {
                for (const stair of chunk.stairsDown) {
                    if (stair.id === id) {
                        const stairContext = {
                            chunk,
                            stair,
                        };
                        return stairContext;
                    }
                }
            }
            for (const dungeon of chunk.dungeons) {
                for (const level of dungeon.levels) {
                    if (direction === __WEBPACK_IMPORTED_MODULE_1__types__["g" /* StairDirection */].Down) {
                        if (level.stairDown.id === id) {
                            const stairContext = {
                                chunk,
                                dungeon,
                                level,
                                stair: level.stairDown,
                            };
                            return stairContext;
                        }
                    }
                    else if (direction === __WEBPACK_IMPORTED_MODULE_1__types__["g" /* StairDirection */].Up) {
                        if (level.stairUp.id === id) {
                            const stairContext = {
                                chunk,
                                dungeon,
                                level,
                                stair: level.stairUp,
                            };
                            return stairContext;
                        }
                    }
                }
            }
        }
    }
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export ascend */
/* unused harmony export attack */
/* harmony export (immutable) */ __webpack_exports__["a"] = calcStats;
/* unused harmony export descend */
/* harmony export (immutable) */ __webpack_exports__["b"] = dropItem;
/* harmony export (immutable) */ __webpack_exports__["c"] = getInventoryChar;
/* harmony export (immutable) */ __webpack_exports__["d"] = moveToCell;
/* unused harmony export moveToArea */
/* unused harmony export openChest */
/* unused harmony export pathfind */
/* harmony export (immutable) */ __webpack_exports__["e"] = pickUpItem;
/* harmony export (immutable) */ __webpack_exports__["f"] = resurrect;
/* harmony export (immutable) */ __webpack_exports__["g"] = tick;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__algorithms__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__generators__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils__ = __webpack_require__(4);






function ascend(actor, stair, area) {
    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} ascends`);
    const stairContext = __WEBPACK_IMPORTED_MODULE_5__utils__["b" /* findStair */](stair.id, __WEBPACK_IMPORTED_MODULE_4__types__["g" /* StairDirection */].Down);
    const newArea = stairContext.level || stairContext.chunk;
    moveToArea(actor, area, newArea, stairContext.stair);
}
function attack(actor, target, area) {
    const actorInfo = __WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[actor.actorType];
    const targetInfo = __WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[target.actorType];
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
        if (target.id === 0 && __WEBPACK_IMPORTED_MODULE_1__game__["b" /* game */].godMode) {
            __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} cannot kill ${target.name}`);
        }
        else {
            __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} kills ${target.name}`);
            target.inventory.forEach((item) => {
                dropItem(target, item, area);
            });
            const corpse = Object.assign({}, target, { equipped: false, itemType: __WEBPACK_IMPORTED_MODULE_4__types__["f" /* ItemType */].Corpse, name: target.name + " corpse" });
            area.actors.splice(area.actors.indexOf(target), 1);
            area.items.push(corpse);
        }
    }
    else {
        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} misses ${target.name}`);
    }
    if (!target.hostileActorIds.some((id) => id === actor.id)) {
        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} is now hostile to ${target.name}`);
        target.hostileActorIds.push(actor.id);
    }
}
function calcStats(actor) {
    const stats = {
        armor: actor.level,
        attunement: actor.level,
        avoidance: actor.level,
        charisma: actor.level,
        encumbrance: actor.level,
        endurance: actor.level,
        energy: actor.level,
        health: actor.level,
        intellect: actor.level,
        luck: actor.level,
        mana: actor.level,
        precision: actor.level,
        resistance: actor.level,
        stamina: actor.level,
        strength: actor.level,
    };
    return stats;
}
function descend(actor, stair, chunk, dungeon, level) {
    const area = level || chunk;
    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} descends`);
    const stairContext = __WEBPACK_IMPORTED_MODULE_5__utils__["b" /* findStair */](stair.id, __WEBPACK_IMPORTED_MODULE_4__types__["g" /* StairDirection */].Up);
    if (stairContext) {
        moveToArea(actor, area, stairContext.level, stairContext.level.stairUp);
    }
    else {
        let newDungeon;
        if (dungeon) {
            newDungeon = dungeon;
        }
        else {
            newDungeon = __WEBPACK_IMPORTED_MODULE_2__generators__["a" /* createDungeon */]();
            chunk.dungeons.push(newDungeon);
        }
        const newLevel = __WEBPACK_IMPORTED_MODULE_2__generators__["b" /* createLevel */](stair.id);
        newDungeon.levels.push(newLevel);
        moveToArea(actor, area, newLevel, newLevel.stairUp);
    }
}
function dropItem(actor, item, area) {
    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} drops a ${item.name}`);
    item.x = actor.x;
    item.y = actor.y;
    item.equipped = false;
    actor.inventory.splice(actor.inventory.indexOf(item), 1);
    area.items.push(item);
}
function getInventoryChar(actor, item) {
    return String.fromCharCode(97 + actor.inventory.indexOf(item));
}
function moveToCell(actor, coord, chunk, dungeon, level) {
    const actorInfo = __WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[actor.actorType];
    const area = level || chunk;
    if (coord.x >= 0 && coord.x < area.width && coord.y >= 0 && coord.y < area.height) {
        {
            const cell = area.cells[coord.x][coord.y];
            switch (cell.type) {
                case __WEBPACK_IMPORTED_MODULE_4__types__["b" /* CellType */].Wall:
                    return;
                case __WEBPACK_IMPORTED_MODULE_4__types__["b" /* CellType */].DoorClosed:
                    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
                        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} opens the door`);
                        cell.type = __WEBPACK_IMPORTED_MODULE_4__types__["b" /* CellType */].DoorOpen;
                    }
                    else {
                        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} can't open the door`);
                    }
                    return;
            }
        }
        if (area.actors.some((target) => {
            if (target !== actor
                && target.x === coord.x && target.y === coord.y) {
                if (__WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[target.actorType].factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                    || actor.hostileActorIds.some((id) => id === target.id)) {
                    attack(actor, target, area);
                }
                return true;
            }
        })) {
            return;
        }
        if (area.chests.some((chest) => {
            if (chest.x === coord.x && chest.y === coord.y) {
                openChest(actor, chest, area);
                return true;
            }
        })) {
            return;
        }
        if (level) {
            if (level.stairDown
                && level.stairDown.x === coord.x && level.stairDown.y === coord.y) {
                descend(actor, level.stairDown, chunk, dungeon, level);
                return;
            }
            if (level.stairUp.x === coord.x && level.stairUp.y === coord.y) {
                ascend(actor, level.stairUp, area);
                return;
            }
        }
        else {
            if (chunk.stairsDown.some((stairDown) => {
                if (stairDown.x === coord.x && stairDown.y === coord.y) {
                    descend(actor, stairDown, chunk, dungeon, level);
                    return true;
                }
            })) {
                return;
            }
        }
        {
            const itemNames = area.items.filter((item) => item.x === coord.x && item.y === coord.y)
                .map((item) => item.name).join(", ");
            if (itemNames) {
                __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} sees ${itemNames}`);
            }
        }
        actor.x = coord.x;
        actor.y = coord.y;
    }
}
function moveToArea(actor, area, newArea, newCoord) {
    area.actors.splice(area.actors.indexOf(actor), 1);
    newArea.actors.push(actor);
    actor.x = newCoord.x;
    actor.y = newCoord.y;
}
function openChest(actor, chest, area) {
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} opens the chest`);
        area.chests.splice(area.chests.indexOf(chest), 1);
        if (chest.loot) {
            if (actor.inventory.length < 26) {
                __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} loots a ${chest.loot.name}`);
                actor.inventory.push(chest.loot);
            }
            else {
                __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name}'s inventory is full`);
            }
        }
        else {
            __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} sees nothing inside`);
        }
    }
    else {
        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} can't open the chest`);
    }
}
function pathfind(actor, coord, chunk, dungeon, level) {
    const area = level || chunk;
    const path = __WEBPACK_IMPORTED_MODULE_0__algorithms__["a" /* aStar */](area, actor, coord);
    if (path && path.length) {
        moveToCell(actor, path.pop(), chunk, dungeon, level);
        return true;
    }
}
function pickUpItem(actor, item, area) {
    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} picks up ${item.name}`);
    item.x = undefined;
    item.y = undefined;
    area.items.splice(area.items.indexOf(item), 1);
    actor.inventory.push(item);
}
function resurrect(actor, corpse, area) {
    const newActor = {
        actorType: corpse.actorType,
        class: corpse.class,
        experience: corpse.experience,
        hostileActorIds: corpse.hostileActorIds,
        id: corpse.id,
        inventory: corpse.inventory,
        level: corpse.level,
        name: corpse.name.replace(" corpse", ""),
        x: corpse.x,
        y: corpse.y,
    };
    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} ressurects ${newActor.name}`);
    area.items.splice(area.items.indexOf(corpse), 1);
    area.actors.push(newActor);
}
function tick(actor, chunk, dungeon, level) {
    const actorInfo = __WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[actor.actorType];
    const area = level || chunk;
    switch (actor.class) {
        case __WEBPACK_IMPORTED_MODULE_4__types__["c" /* Class */].Warrior:
            break;
        case __WEBPACK_IMPORTED_MODULE_4__types__["c" /* Class */].Shaman:
            if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
                const corpses = area.items.filter((item) => "id" in item
                    && __WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[item.actorType].factions.every((faction) => actorInfo.hostileFactions.indexOf(faction) === -1)
                    && __WEBPACK_IMPORTED_MODULE_0__algorithms__["c" /* lineOfSight */](area, actor, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](actor, item), actorInfo.sight)
                        .some((coord) => coord.x === item.x && coord.y === item.y))
                    .map((item) => item);
                if (corpses.length) {
                    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
                        resurrect(actor, corpses[0], area);
                    }
                    else {
                        __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} fails to ressurect ${corpses[0].name}`);
                    }
                    return;
                }
            }
            break;
    }
    switch (actorInfo.disposition) {
        case __WEBPACK_IMPORTED_MODULE_4__types__["d" /* Disposition */].Passive:
            break;
        case __WEBPACK_IMPORTED_MODULE_4__types__["d" /* Disposition */].Aggressive:
            if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
                const targets = area.actors.filter((target) => target !== actor
                    && (__WEBPACK_IMPORTED_MODULE_1__game__["a" /* config */].actorInfo[target.actorType].factions.some((faction) => actorInfo.hostileFactions.indexOf(faction) > -1)
                        || actor.hostileActorIds.some((id) => id === target.id))
                    && __WEBPACK_IMPORTED_MODULE_0__algorithms__["c" /* lineOfSight */](area, actor, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](actor, target), actorInfo.sight)
                        .some((coord) => coord.x === target.x && coord.y === target.y));
                if (targets.length) {
                    __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} spots ${targets[0].name}`);
                    if (pathfind(actor, targets[0], chunk, dungeon, level)) {
                        return;
                    }
                }
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_4__types__["d" /* Disposition */].Cowardly:
            break;
    }
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
        const targets = area.chests.filter((chest) => __WEBPACK_IMPORTED_MODULE_0__algorithms__["c" /* lineOfSight */](area, actor, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](actor, chest), actorInfo.sight)
            .some((coord) => coord.x === chest.x && coord.y === chest.y))
            .map((chest) => ({ x: chest.x, y: chest.y, name: "chest" }))
            || area.items.filter((item) => !("id" in item)
                && __WEBPACK_IMPORTED_MODULE_0__algorithms__["c" /* lineOfSight */](area, actor, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](actor, item), actorInfo.sight)
                    .some((coord) => coord.x === item.x && coord.y === item.y));
        if (targets.length) {
            __WEBPACK_IMPORTED_MODULE_1__game__["d" /* log */](area, actor, `${actor.name} spots ${targets[0].name}`);
            if (pathfind(actor, targets[0], chunk, dungeon, level)) {
                return;
            }
        }
    }
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5 && area.items.some((item) => {
        if (item.x === actor.x && item.y === actor.y) {
            pickUpItem(actor, item, area);
            return true;
        }
    })) {
        return;
    }
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5 && actor.inventory.some((item) => {
        if (item.name.includes("corpse")) {
            dropItem(actor, item, area);
            return true;
        }
    })) {
        return;
    }
    if (__WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1) < 0.5) {
        const roll = __WEBPACK_IMPORTED_MODULE_3__math__["d" /* randomFloat */](0, 1);
        if (roll < 0.25) {
            moveToCell(actor, { x: actor.x, y: actor.y - 1 }, chunk, dungeon, level);
        }
        else if (roll < 0.5) {
            moveToCell(actor, { x: actor.x + 1, y: actor.y }, chunk, dungeon, level);
        }
        else if (roll < 0.75) {
            moveToCell(actor, { x: actor.x, y: actor.y + 1 }, chunk, dungeon, level);
        }
        else {
            moveToCell(actor, { x: actor.x - 1, y: actor.y }, chunk, dungeon, level);
        }
    }
}


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createChunk */
/* harmony export (immutable) */ __webpack_exports__["a"] = createDungeon;
/* harmony export (immutable) */ __webpack_exports__["b"] = createLevel;
/* harmony export (immutable) */ __webpack_exports__["c"] = createWorld;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__math__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__types__ = __webpack_require__(2);



function createChunk(opts) {
    const width = opts && opts.width || 100;
    const height = opts && opts.height || 100;
    const dungeonAmount = opts && opts.dungeonAmount || 100;
    const chunk = {
        actors: [],
        cells: [[]],
        chests: [],
        dungeons: [],
        height,
        items: [],
        stairsDown: [],
        width,
    };
    for (let x = 0; x < chunk.width; x++) {
        chunk.cells[x] = [];
        for (let y = 0; y < chunk.height; y++) {
            chunk.cells[x][y] = {
                discovered: false,
                type: __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Grass,
            };
        }
    }
    for (let i = 0; i < dungeonAmount; i++) {
        chunk.stairsDown.push({
            direction: __WEBPACK_IMPORTED_MODULE_2__types__["g" /* StairDirection */].Down,
            id: __WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].currentStairId++,
            x: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](0, chunk.width),
            y: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](0, chunk.height),
        });
    }
    return chunk;
}
function createDungeon(opts) {
    const name = opts && opts.name;
    const maxLevels = opts && opts.maxLevels || 1;
    const dungeon = {
        levels: [],
        maxLevels,
        name,
    };
    if (!dungeon.name) {
        const roll = __WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1);
        if (roll < 0.25) {
            dungeon.name = "cool dungeon";
        }
        else if (roll < 0.5) {
            dungeon.name = "awesome dungeon";
        }
        else if (roll < 0.75) {
            dungeon.name = "terrible dungeon";
        }
        else {
            dungeon.name = "low effort dungeon";
        }
    }
    return dungeon;
}
function createLevel(stairDownId, opts) {
    const width = opts && opts.width || 50;
    const height = opts && opts.height || 50;
    const roomAttempts = opts && opts.roomAttempts || 20;
    const minRoomSize = opts && opts.minRoomSize || 5;
    const maxRoomSize = opts && opts.maxRoomSize || 15;
    const preventOverlap = opts && opts.preventOverlap || true;
    const litRooms = opts && opts.litRooms || false;
    const doorChance = opts && opts.doorChance || 0.5;
    const monsterAmount = opts && opts.monsterAmount || 5;
    const chestAmount = opts && opts.chestAmount || 5;
    const level = {
        actors: [],
        cells: [[]],
        chests: [],
        height,
        items: [],
        litRooms,
        rooms: [],
        stairDown: undefined,
        stairUp: undefined,
        width,
    };
    for (let x = 0; x < level.width; x++) {
        level.cells[x] = [];
        for (let y = 0; y < level.height; y++) {
            level.cells[x][y] = {
                discovered: false,
                type: __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty,
            };
        }
    }
    for (let i = 0; i < roomAttempts || level.rooms.length < 2; i++) {
        const room = {
            height: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](minRoomSize, maxRoomSize),
            left: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](0, level.width),
            top: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](0, level.height),
            width: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](minRoomSize, maxRoomSize),
        };
        if (room.left < 1 || room.left + room.width > level.width - 1 || room.top < 1
            || room.top + room.height > level.height - 1) {
            continue;
        }
        if (preventOverlap && (() => {
            for (let x = room.left; x < room.left + room.width; x++) {
                for (let y = room.top; y < room.top + room.height; y++) {
                    if (level.cells[x][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                        return true;
                    }
                    if (level.cells[x][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                        return true;
                    }
                    if (level.cells[x + 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                        return true;
                    }
                    if (level.cells[x][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                        return true;
                    }
                    if (level.cells[x - 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                        return true;
                    }
                }
            }
        })()) {
            continue;
        }
        for (let x = room.left; x < room.left + room.width; x++) {
            for (let y = room.top; y < room.top + room.height; y++) {
                level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor;
            }
        }
        level.rooms.push(room);
    }
    for (let i = 0; i < level.rooms.length - 1; i++) {
        let x1 = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[i].left, level.rooms[i].left + level.rooms[i].width);
        let y1 = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[i].top, level.rooms[i].top + level.rooms[i].height);
        let x2 = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[i + 1].left, level.rooms[i + 1].left + level.rooms[i + 1].width);
        let y2 = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[i + 1].top, level.rooms[i + 1].top + level.rooms[i + 1].height);
        if (x1 > x2) {
            const t = x1;
            x1 = x2;
            x2 = t;
        }
        if (y1 > y2) {
            const t = y1;
            y1 = y2;
            y2 = t;
        }
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (x === x1 || x === x2 || y === y1 || y === y2) {
                    level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor;
                }
            }
        }
    }
    for (let x = 0; x < level.width; x++) {
        for (let y = 0; y < level.height; y++) {
            if (level.cells[x][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                if (level.cells[x][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x][y - 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x + 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x + 1][y - 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x + 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x + 1][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x + 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x + 1][y + 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x][y + 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x - 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x - 1][y - 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x - 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x - 1][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
                if (level.cells[x - 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Empty) {
                    level.cells[x - 1][y + 1].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall;
                }
            }
        }
    }
    for (let x = 0; x < level.width; x++) {
        for (let y = 0; y < level.height; y++) {
            if (level.cells[x][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                && __WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1) < doorChance) {
                if (level.cells[x][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x + 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x - 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                    if (level.cells[x - 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall
                        && level.cells[x + 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall) {
                        level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].DoorClosed;
                    }
                }
                if (level.cells[x + 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x + 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x + 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                    if (level.cells[x][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall
                        && level.cells[x][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall) {
                        level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].DoorClosed;
                    }
                }
                if (level.cells[x][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x + 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x - 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                    if (level.cells[x - 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall
                        && level.cells[x + 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall) {
                        level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].DoorClosed;
                    }
                }
                if (level.cells[x - 1][y].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x - 1][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor
                    && level.cells[x - 1][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Floor) {
                    if (level.cells[x][y + 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall
                        && level.cells[x][y - 1].type === __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].Wall) {
                        level.cells[x][y].type = __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CellType */].DoorClosed;
                    }
                }
            }
        }
    }
    level.stairDown = {
        direction: __WEBPACK_IMPORTED_MODULE_2__types__["g" /* StairDirection */].Down,
        id: __WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].currentStairId++,
        x: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[0].left, level.rooms[0].left + level.rooms[0].width),
        y: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[0].top, level.rooms[0].top + level.rooms[0].height),
    };
    level.stairUp = {
        direction: __WEBPACK_IMPORTED_MODULE_2__types__["g" /* StairDirection */].Up,
        id: stairDownId,
        x: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[level.rooms.length - 1].left, level.rooms[level.rooms.length - 1].left + level.rooms[level.rooms.length - 1].width),
        y: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[level.rooms.length - 1].top, level.rooms[level.rooms.length - 1].top + level.rooms[level.rooms.length - 1].height),
    };
    for (let i = 0; i < monsterAmount; i++) {
        const roomIndex = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](1, level.rooms.length);
        const monster = {
            actorType: undefined,
            class: __WEBPACK_IMPORTED_MODULE_2__types__["c" /* Class */].None,
            experience: 0,
            hostileActorIds: [],
            id: __WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].currentActorId++,
            inventory: [],
            level: 1,
            name: undefined,
            x: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[roomIndex].left, level.rooms[roomIndex].left + level.rooms[roomIndex].width),
            y: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[roomIndex].top, level.rooms[roomIndex].top + level.rooms[roomIndex].height),
        };
        const roll = __WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1);
        if (roll < 0.25) {
            monster.name = "rat";
            monster.actorType = __WEBPACK_IMPORTED_MODULE_2__types__["a" /* ActorType */].Rat;
        }
        else if (roll < 0.50) {
            monster.name = "slime";
            monster.actorType = __WEBPACK_IMPORTED_MODULE_2__types__["a" /* ActorType */].Slime;
        }
        else if (roll < 0.75) {
            monster.name = "orc";
            monster.actorType = __WEBPACK_IMPORTED_MODULE_2__types__["a" /* ActorType */].Orc;
            if (__WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1) < 0.5) {
                monster.name += " shaman";
                monster.class = __WEBPACK_IMPORTED_MODULE_2__types__["c" /* Class */].Shaman;
            }
        }
        else {
            monster.name = "bugbear";
            monster.actorType = __WEBPACK_IMPORTED_MODULE_2__types__["a" /* ActorType */].Bugbear;
            if (__WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1) < 0.5) {
                monster.name += " shaman";
                monster.class = __WEBPACK_IMPORTED_MODULE_2__types__["c" /* Class */].Shaman;
            }
        }
        level.actors.push(monster);
    }
    for (let i = 0; i < chestAmount; i++) {
        const roomIndex = __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](0, level.rooms.length);
        level.chests.push({
            loot: (() => {
                if (__WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1) < 0.5) {
                    const item = {
                        equipped: false,
                        itemType: undefined,
                        name: undefined,
                        x: undefined,
                        y: undefined,
                    };
                    const roll = __WEBPACK_IMPORTED_MODULE_1__math__["d" /* randomFloat */](0, 1);
                    if (roll < 0.25) {
                        item.name = "sword";
                        item.itemType = __WEBPACK_IMPORTED_MODULE_2__types__["f" /* ItemType */].Sword;
                    }
                    else if (roll < 0.50) {
                        item.name = "spear";
                        item.itemType = __WEBPACK_IMPORTED_MODULE_2__types__["f" /* ItemType */].Spear;
                    }
                    else if (roll < 0.75) {
                        item.name = "shield";
                        item.itemType = __WEBPACK_IMPORTED_MODULE_2__types__["f" /* ItemType */].Shield;
                    }
                    else {
                        item.name = "bow";
                        item.itemType = __WEBPACK_IMPORTED_MODULE_2__types__["f" /* ItemType */].Bow;
                    }
                    return item;
                }
            })(),
            x: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[roomIndex].left, level.rooms[roomIndex].left + level.rooms[roomIndex].width),
            y: __WEBPACK_IMPORTED_MODULE_1__math__["e" /* randomInt */](level.rooms[roomIndex].top, level.rooms[roomIndex].top + level.rooms[roomIndex].height),
        });
    }
    return level;
}
function createWorld(opts) {
    const width = opts && opts.width || 0;
    const height = opts && opts.height || 0;
    const world = {
        chunks: [[]],
        height,
        width,
    };
    for (let x = 0; x < world.width; x++) {
        // world.chunks[x] = [];
        for (let y = 0; y < world.height; y++) {
            // world.chunks[x][y] = createChunk();
        }
    }
    {
        const playerChunk = world.chunks[0][0] = createChunk();
        const player = {
            actorType: __WEBPACK_IMPORTED_MODULE_2__types__["a" /* ActorType */].Player,
            class: __WEBPACK_IMPORTED_MODULE_2__types__["c" /* Class */].Warrior,
            experience: 0,
            hostileActorIds: [],
            id: 0,
            inventory: [],
            level: 1,
            name: "player",
            x: Math.round(playerChunk.width / 2),
            y: Math.round(playerChunk.height / 2),
        };
        playerChunk.actors.push(player);
    }
    return world;
}


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = draw;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__actors__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__algorithms__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils__ = __webpack_require__(4);






const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
function draw(ev) {
    const playerContext = __WEBPACK_IMPORTED_MODULE_5__utils__["a" /* findActor */](0);
    const player = playerContext.actor;
    const chunk = playerContext.chunk;
    const dungeon = playerContext.dungeon;
    const level = playerContext.level;
    const area = level || chunk;
    const playerInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].actorInfo[player.actorType];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const view = {
        height: 0,
        left: 0,
        top: 0,
        width: 0,
    };
    view.width = Math.round(canvas.width / __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize);
    view.height = Math.round(canvas.height / __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize);
    view.left = player.x - Math.round(view.width / 2);
    view.top = player.y - Math.round(view.height / 2);
    if (view.left < 0) {
        view.left = 0;
    }
    if (view.left + view.width > area.width) {
        view.left = area.width - view.width;
    }
    if (view.top < 0) {
        view.top = 0;
    }
    if (view.top + view.height > area.height) {
        view.top = area.height - view.height;
    }
    const visibleCells = __WEBPACK_IMPORTED_MODULE_1__algorithms__["b" /* fieldOfView */](area, player, 0.5, playerInfo.sight)
        .map((coord) => area.cells[coord.x][coord.y]);
    visibleCells.forEach((cell) => {
        cell.discovered = true;
    });
    if (__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].ignoreFov) {
        for (let x = view.left; x < view.left + view.width; x++) {
            for (let y = view.top; y < view.top + view.height; y++) {
                if (x >= 0 && x < area.width && y >= 0 && y < area.height
                    && visibleCells.indexOf(area.cells[x][y]) === -1) {
                    visibleCells.push(area.cells[x][y]);
                }
            }
        }
    }
    if (level && level.litRooms) {
        level.rooms.forEach((room) => {
            if (__WEBPACK_IMPORTED_MODULE_3__math__["b" /* isInside */]({ x: player.x, y: player.y }, room)) {
                for (let x = room.left - 1; x < room.left + room.width + 1; x++) {
                    for (let y = room.top - 1; y < room.top + room.height + 1; y++) {
                        if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                            area.cells[x][y].discovered = true;
                            if (visibleCells.indexOf(area.cells[x][y]) === -1) {
                                visibleCells.push(area.cells[x][y]);
                            }
                        }
                    }
                }
            }
        });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize + "px mono";
    for (let x = view.left; x < view.left + view.width; x++) {
        for (let y = view.top; y < view.top + view.height; y++) {
            if (x >= 0 && x < area.width && y >= 0 && y < area.height) {
                const screen = { x: (x - view.left) * __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize, y: (y - view.top + 1) * __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize };
                if (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].Target) {
                    if (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.x + 1 === x && __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.y === y) {
                        ctx.fillStyle = "#ffffff";
                        ctx.globalAlpha = 1;
                        ctx.fillText("]", screen.x, screen.y);
                        continue;
                    }
                    if (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.x - 1 === x && __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.y === y) {
                        ctx.fillStyle = "#ffffff";
                        ctx.globalAlpha = 1;
                        ctx.fillText("[", screen.x, screen.y);
                        continue;
                    }
                }
                if (visibleCells.indexOf(area.cells[x][y]) > -1) {
                    if (area.actors.some((actor) => {
                        if (actor.x === x && actor.y === y) {
                            const actorInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].actorInfo[actor.actorType];
                            const classInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].classInfo[actor.class];
                            ctx.fillStyle = classInfo.color;
                            ctx.globalAlpha = 1;
                            ctx.fillText(actorInfo.char, screen.x, screen.y);
                            return true;
                        }
                    })) {
                        continue;
                    }
                    if (area.chests.some((chest) => {
                        if (chest.x === x && chest.y === y) {
                            ctx.fillStyle = "#ffffff";
                            ctx.globalAlpha = 1;
                            ctx.fillText("~", screen.x, screen.y);
                            return true;
                        }
                    })) {
                        continue;
                    }
                    if (area.items.sort((a, b) => {
                        return 0;
                    }).some((item) => {
                        if (item.x === x && item.y === y) {
                            const itemInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].itemInfo[item.itemType];
                            ctx.fillStyle = ("class" in item) ? __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].classInfo[item.class].color : "#ffffff";
                            ctx.globalAlpha = 1;
                            ctx.fillText(itemInfo.char, screen.x, screen.y);
                            return true;
                        }
                    })) {
                        continue;
                    }
                }
                {
                    let stair;
                    if (level) {
                        if (level.stairDown
                            && level.stairDown.x === x && level.stairDown.y === y) {
                            stair = level.stairDown;
                        }
                        if (level.stairUp.x === x && level.stairUp.y === y) {
                            stair = level.stairUp;
                        }
                    }
                    else {
                        chunk.stairsDown.forEach((stairDown) => {
                            if (stairDown.x === x && stairDown.y === y) {
                                stair = stairDown;
                                return;
                            }
                        });
                    }
                    if (stair) {
                        const stairInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].stairInfo[stair.direction];
                        ctx.fillStyle = stairInfo.color;
                        ctx.globalAlpha = visibleCells.indexOf(area.cells[x][y]) > -1 ? 1
                            : area.cells[x][y].discovered ? 0.25
                                : 0;
                        ctx.fillText(stairInfo.char, screen.x, screen.y);
                        continue;
                    }
                }
                const cellInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].cellInfo[area.cells[x][y].type];
                ctx.fillStyle = cellInfo.color;
                ctx.globalAlpha = visibleCells.indexOf(area.cells[x][y]) > -1 ? 1
                    : area.cells[x][y].discovered ? 0.25
                        : 0;
                ctx.fillText(cellInfo.char, screen.x, screen.y);
            }
        }
    }
    __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].messages.forEach((message, index) => {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.fillText(message, 0, __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize * (index + 1));
    });
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 1;
    ctx.fillText(`Dungeon: ${dungeon ? chunk.dungeons.indexOf(dungeon) : "N/A"} Level: ${dungeon && level ? dungeon.levels.indexOf(level) : "N/A"} Turn: ${__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].turn}`, 0, canvas.height);
    if (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].Inventory
        || __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].InventoryDrop
        || __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].InventoryEquip
        || __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].InventorySwapFirst
        || __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].InventorySwapSecond
        || __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].InventoryUnequip) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        player.inventory.forEach((item, index) => {
            ctx.fillText(`${__WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)}) ${item.name}${item.equipped ? " (equipped)" : ""}`, canvas.width - (__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize * 10), (index + 1) * __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize);
        });
    }
    if (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode === __WEBPACK_IMPORTED_MODULE_4__types__["h" /* UIMode */].Character) {
        const stats = __WEBPACK_IMPORTED_MODULE_0__actors__["a" /* calcStats */](player);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1;
        ctx.fillText(`Health: ${stats.health}`, canvas.width - (__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize * 10), __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize);
        ctx.fillText(`Mana: ${stats.mana}`, canvas.width - (__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize * 10), __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize * 2);
    }
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__generators__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__input__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__renderer__ = __webpack_require__(7);




__WEBPACK_IMPORTED_MODULE_0__game__["b" /* game */].world = __WEBPACK_IMPORTED_MODULE_1__generators__["c" /* createWorld */]();
document.addEventListener("keydown", __WEBPACK_IMPORTED_MODULE_2__input__["a" /* input */]);
window.addEventListener("resize", __WEBPACK_IMPORTED_MODULE_3__renderer__["a" /* draw */]);
__WEBPACK_IMPORTED_MODULE_3__renderer__["a" /* draw */]();


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = input;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__actors__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__algorithms__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__game__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__math__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__renderer__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__types__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__utils__ = __webpack_require__(4);







function input(ev) {
    const playerContext = __WEBPACK_IMPORTED_MODULE_6__utils__["a" /* findActor */](0);
    const player = playerContext.actor;
    const playerInfo = __WEBPACK_IMPORTED_MODULE_2__game__["a" /* config */].actorInfo[player.actorType];
    const chunk = playerContext.chunk;
    const dungeon = playerContext.dungeon;
    const level = playerContext.level;
    const area = level || chunk;
    switch (__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode) {
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default:
            switch (ev.key) {
                case "ArrowUp":
                    __WEBPACK_IMPORTED_MODULE_0__actors__["d" /* moveToCell */](player, { x: player.x, y: player.y - 1 }, chunk, dungeon, level);
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "ArrowRight":
                    __WEBPACK_IMPORTED_MODULE_0__actors__["d" /* moveToCell */](player, { x: player.x + 1, y: player.y }, chunk, dungeon, level);
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "ArrowDown":
                    __WEBPACK_IMPORTED_MODULE_0__actors__["d" /* moveToCell */](player, { x: player.x, y: player.y + 1 }, chunk, dungeon, level);
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "ArrowLeft":
                    __WEBPACK_IMPORTED_MODULE_0__actors__["d" /* moveToCell */](player, { x: player.x - 1, y: player.y }, chunk, dungeon, level);
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case ".":
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "g":
                    area.items.forEach((item) => {
                        if (item.x === player.x && item.y === player.y) {
                            __WEBPACK_IMPORTED_MODULE_0__actors__["e" /* pickUpItem */](player, item, area);
                        }
                    });
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "s":
                    const targets = area.actors.filter((target) => target !== player
                        && __WEBPACK_IMPORTED_MODULE_1__algorithms__["c" /* lineOfSight */](area, player, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](player, target), playerInfo.sight)
                            .some((coord) => coord.x === target.x && coord.y === target.y));
                    if (targets.length) {
                        __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} spots ${targets.map((target) => target.name).join(", ")}`);
                    }
                    else {
                        __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} doesn"t see anything`);
                    }
                    break;
                case "r":
                    area.items.filter((item) => "id" in item
                        && __WEBPACK_IMPORTED_MODULE_1__algorithms__["c" /* lineOfSight */](area, player, __WEBPACK_IMPORTED_MODULE_3__math__["c" /* radiansBetween */](player, item), playerInfo.sight)
                            .some((coord) => coord.x === item.x && coord.y === item.y))
                        .map((item) => item)
                        .forEach((corpse) => __WEBPACK_IMPORTED_MODULE_0__actors__["f" /* resurrect */](player, corpse, area));
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "c":
                    if (area.cells[player.x][player.y].type === __WEBPACK_IMPORTED_MODULE_5__types__["b" /* CellType */].DoorOpen) {
                        __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} closes the door`);
                        area.cells[player.x][player.y].type = __WEBPACK_IMPORTED_MODULE_5__types__["b" /* CellType */].DoorClosed;
                    }
                    __WEBPACK_IMPORTED_MODULE_2__game__["f" /* tick */]();
                    break;
                case "t":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Target;
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.x = player.x;
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.y = player.y;
                    break;
                case "i":
                    if (player.inventory.length > 0) {
                        __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Inventory;
                    }
                    break;
                case "o":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Character;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Target:
            switch (ev.key) {
                case "ArrowUp":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.y--;
                    break;
                case "ArrowRight":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.x++;
                    break;
                case "ArrowDown":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.y++;
                    break;
                case "ArrowLeft":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].target.x--;
                    break;
                case "t":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Inventory:
            switch (ev.key) {
                case "i":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
                case "d":
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "select item to drop");
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "press space to cancel");
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryDrop;
                    break;
                case "e":
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "select item to equip");
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "press space to cancel");
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryEquip;
                    break;
                case "u":
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "select item to unequip");
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "press space to cancel");
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryUnequip;
                    break;
                case "s":
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "select first item to swap");
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "press space to cancel");
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventorySwapFirst;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryDrop:
            player.inventory.forEach((item) => {
                if (ev.key === __WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)) {
                    __WEBPACK_IMPORTED_MODULE_0__actors__["b" /* dropItem */](player, item, area);
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                }
            });
            switch (ev.key) {
                case " ":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryEquip:
            player.inventory.forEach((item) => {
                if (ev.key === __WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)) {
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} equips a ${item.name}`);
                    item.equipped = true;
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                }
            });
            switch (ev.key) {
                case " ":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventoryUnequip:
            player.inventory.forEach((item) => {
                if (ev.key === __WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)) {
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} unequips a ${item.name}`);
                    item.equipped = false;
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                }
            });
            switch (ev.key) {
                case " ":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventorySwapFirst:
            player.inventory.forEach((item, index) => {
                if (ev.key === __WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)) {
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapFirst = index;
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "select second item to swap");
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "press space to cancel");
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventorySwapSecond;
                }
            });
            switch (ev.key) {
                case " ":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].InventorySwapSecond:
            player.inventory.forEach((item, index) => {
                if (ev.key === __WEBPACK_IMPORTED_MODULE_0__actors__["c" /* getInventoryChar */](player, item)) {
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapSecond = index;
                    __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, `${player.name} swaps the ${player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapFirst].name} with the ${player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapSecond].name}`);
                    const t = player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapFirst];
                    player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapFirst] = player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapSecond];
                    player.inventory[__WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].inventorySwapSecond] = t;
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                }
            });
            switch (ev.key) {
                case " ":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
        case __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Character:
            switch (ev.key) {
                case "o":
                    __WEBPACK_IMPORTED_MODULE_2__game__["g" /* ui */].mode = __WEBPACK_IMPORTED_MODULE_5__types__["h" /* UIMode */].Default;
                    break;
            }
            break;
    }
    switch (ev.key) {
        case "[":
            __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "game saved");
            __WEBPACK_IMPORTED_MODULE_2__game__["e" /* save */]();
            break;
        case "]":
            __WEBPACK_IMPORTED_MODULE_2__game__["d" /* log */](area, player, "game loaded");
            __WEBPACK_IMPORTED_MODULE_2__game__["c" /* load */]();
            break;
        case "\\":
            console.log(__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */]);
            break;
        case "-":
            __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize--;
            break;
        case "=":
            __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].fontSize++;
            break;
        case "1":
            __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].godMode = !__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].godMode;
            break;
        case "2":
            __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].stopTime = !__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].stopTime;
            break;
        case "3":
            __WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].ignoreFov = !__WEBPACK_IMPORTED_MODULE_2__game__["b" /* game */].ignoreFov;
            break;
    }
    __WEBPACK_IMPORTED_MODULE_4__renderer__["a" /* draw */]();
}


/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map