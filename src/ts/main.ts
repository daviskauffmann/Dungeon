let game: Game = {
    currentId: 1,
    dungeons: [
        createTown()
    ],
    turn: 0,
    messages: [],
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
        { char: '+', color: '#ffffff', alpha: 1 },
        { char: '-', color: '#ffffff', alpha: 1 },
        { char: '<', color: '#ffffff', alpha: 1 },
        { char: '>', color: '#ffffff', alpha: 1 }
    ]
}

const ui: UI = {
    mode: '',
    inventorySwapFirst: -1,
    inventorySwapSecond: -1,
    target: {
        x: 0,
        y: 0
    }
}

draw(undefined, getPlayer());
window.addEventListener('resize', (ev) => draw(ev, getPlayer()));
document.addEventListener('keydown', (ev) => input(ev, getPlayer()));
