import { init } from "./game";
import { keydown, mousedown } from "./input";
import { draw } from "./renderer";

init();

document.addEventListener("keydown", keydown);
window.addEventListener("resize", draw);

document.addEventListener("mousedown", mousedown);

draw();
