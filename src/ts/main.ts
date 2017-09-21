import { init } from "./game";
import { keydown, mousedown } from "./input";
import { draw } from "./renderer";

init();

document.addEventListener("keydown", keydown);
document.addEventListener("mousedown", mousedown);
window.addEventListener("resize", draw);

draw();
