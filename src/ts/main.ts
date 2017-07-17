import { game } from "./game";
import { createWorld } from "./generators";
import { input } from "./input";
import { draw } from "./renderer";

game.world = createWorld();

document.addEventListener("keydown", input);
window.addEventListener("resize", draw);

draw();
