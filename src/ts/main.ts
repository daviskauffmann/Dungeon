let game: Game = {
    currentId: 0,
    dungeons: [],
    turn: 0,
    godMode: true,
    stopTime: false,
    ignoreFov: false
}

const canvas: any = document.getElementById('game');

const ctx = canvas.getContext('2d');

const graphics: Graphics = {
    fontSize: 24,
    cellTypes: [
        { char: ' ', color: '#ffffff', alpha: 1 },
        { char: '.', color: '#ffffff', alpha: 1 },
        { char: '^', color: '#50ff50', alpha: 1 },
        { char: '#', color: '#ffffff', alpha: 1 }, 
        { char: '-', color: '#ffffff', alpha: 1 },
        { char: '+', color: '#ffffff', alpha: 1 },
        { char: '<', color: '#ffffff', alpha: 1 },
        { char: '>', color: '#ffffff', alpha: 1 }
    ]
}

const ui: UI = {
    mode: '',
    messages: [],
    maxMessages: 10,
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: {
        x: 0,
        y: 0
    }
}

game.dungeons.push(createTown());

draw(undefined, getEntity(0));

window.addEventListener('resize', (ev) => draw(ev, getEntity(0)));
document.addEventListener('keydown', (ev) => input(ev, getEntity(0)));
