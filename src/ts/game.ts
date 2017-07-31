import { lineOfSight } from "./algorithms";
import { createChunk } from "./generators";
import { radiansBetween } from "./math";
import { Actor, ActorType, Area, Class, Config, Coord, Disposition, Faction, Game, UI, UIMode, World } from "./types";
import { findActor } from "./world";

export const config: Config = {
    actorInfo: {
        Bugbear: {
            char: "b",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Monster,
                Faction.Bugbear,
            ],
            hostileFactions: [
                Faction.Player,
                Faction.Orc,
            ],
            sight: 10,
        },
        Orc: {
            char: "o",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Monster,
                Faction.Orc,
            ],
            hostileFactions: [
                Faction.Player,
                Faction.Bugbear,
            ],
            sight: 10,
        },
        Player: {
            char: "@",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Player,
            ],
            hostileFactions: [
                Faction.Monster,
            ],
            sight: 5,
        },
        Rat: {
            char: "r",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Monster,
            ],
            hostileFactions: [],
            sight: 10,
        },
        Slime: {
            char: "s",
            disposition: Disposition.Aggressive,
            factions: [
                Faction.Monster,
            ],
            hostileFactions: [],
            sight: 10,
        },
    },
    cellInfo: {
        DoorClosed: {
            char: "+",
            color: "#ffffff",
            opaque: true,
            solid: true,
        },
        DoorOpen: {
            char: "-",
            color: "#ffffff",
            opaque: false,
            solid: false,
        },
        Empty: {
            char: " ",
            color: "#ffffff",
            opaque: false,
            solid: false,
        },
        Floor: {
            char: ".",
            color: "#ffffff",
            opaque: false,
            solid: false,
        },
        Grass: {
            char: "^",
            color: "#50ff50",
            opaque: false,
            solid: false,
        },
        Wall: {
            char: "#",
            color: "#ffffff",
            opaque: true,
            solid: true,
        },
        Window: {
            char: "#",
            color: "#0000ff",
            opaque: false,
            solid: true,
        },
    },
    chestCommon: {
        char: "~",
        color: "#ffffff",
    },
    classInfo: {
        None: {
            color: "#ffffff",
        },
        Shaman: {
            color: "#ffff00",
        },
        Warrior: {
            color: "#ffffff",
        },
    },
    equipmentInfo: {
        Bow: {
            char: "}",
        },
        Shield: {
            char: ")",
        },
        Spear: {
            char: "/",
        },
        Sword: {
            char: "|",
        },
    },
    itemInfo: {
        Corpse: {
            char: "%",
        },
        Equipment: {
            color: "#ffffff",
        },
        Potion: {
            char: "!",
        },
        Scroll: {
            char: "?",
            color: "#ffffff",
        },
    },
    potionInfo: {
        Energy: {
            color: "#00ff00",
        },
        Health: {
            color: "#ff0000",
        },
        Mana: {
            color: "#0000ff",
        },
    },
    stairCommon: {
        color: "#ffffff",
    },
    stairInfo: {
        Down: {
            char: ">",
        },
        Up: {
            char: "<",
        },
    },
};

export let game: Game;

export function init() {
    game = {
        fontSize: 24,
        godMode: true,
        ignoreFov: false,
        messages: [],
        stopTime: false,
        world: {
            chunks: {},
            currentActorId: 1,
            currentStairId: 0,
            turn: 0,
        },
    };

    {
        const playerChunk = game.world.chunks["0_0"] = createChunk();

        const player: Actor = {
            actorType: ActorType.Player,
            class: Class.Warrior,
            energy: 100,
            experience: 0,
            health: 100,
            hostileActorIds: [],
            id: 0,
            inventory: [],
            level: 1,
            mana: 100,
            name: "player",
            x: Math.round(playerChunk.width / 2),
            y: Math.round(playerChunk.height / 2),
        };

        playerChunk.actors.push(player);
    }
}

export function load() {
    game = JSON.parse(localStorage.getItem("game"));
    console.log(game);
}

export function log(area: Area, location: Coord, message: string) {
    const actorContext = findActor(0);
    const { actor } = actorContext;

    const actorInfo = config.actorInfo[ActorType[actor.actorType]];

    if ((area === actorContext.level || area === actorContext.chunk)
        && lineOfSight(area, actor, radiansBetween(actor, location), actorInfo.sight)
            .find((coord) => coord.x === location.x && coord.y === location.y)) {
        game.messages.push(message);

        if (game.messages.length > ui.maxMessages) {
            game.messages.shift();
        }
    }
}

export function save() {
    localStorage.setItem("game", JSON.stringify(game));
    console.log(JSON.stringify(game));
}

export const ui: UI = {
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    maxMessages: 10,
    mode: UIMode.Default,
    target: { x: 0, y: 0 },
};
