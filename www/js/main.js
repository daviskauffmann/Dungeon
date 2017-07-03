var game = {
    id: 1,
    dungeons: [],
    turn: 0,
    messages: [],
    stopTime: false,
    ignoreFov: false
}

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var view = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    characterSize: 24
}

var ui = {
    mode: '',
    inventorySwapFirst: undefined,
    inventorySwapSecond: undefined,
    target: {
        x: 0,
        y: 0
    }
}

createTown();

draw();
window.addEventListener('resize', draw);