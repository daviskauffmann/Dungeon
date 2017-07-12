import { createTown } from './dungeon';
import { getEntity } from './entity';
import { game } from './game';
import { input } from './input';
import { draw } from './renderer';

game.dungeons.push(createTown());

window.addEventListener('resize', draw);
document.addEventListener('keydown', input);

draw(undefined);
