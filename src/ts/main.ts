import { createTown } from "./dungeon";
import { game } from "./game";
import { input } from "./input";
import { draw } from "./renderer";

game.chunks[0][0] = createTown();

document.addEventListener("keydown", input);
window.addEventListener("resize", draw);

draw();
