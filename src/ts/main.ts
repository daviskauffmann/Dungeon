import { createTown } from './dungeon';
import { getEntity } from './entity';
import { game } from './game';
import { input } from './input';
import { draw } from './renderer';

game.dungeons.push(createTown());

window.addEventListener('resize', (ev) => draw(ev, getEntity(0)));
document.addEventListener('keydown', (ev) => input(ev, getEntity(0)));

draw(undefined, getEntity(0));
