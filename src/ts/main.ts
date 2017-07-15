import { createTown } from './dungeon';
import { game } from './game';
import { input } from './input';
import { draw } from './renderer';

game.dungeons.push(createTown());

window.addEventListener('resize', draw);
document.addEventListener('keydown', input);

draw();
