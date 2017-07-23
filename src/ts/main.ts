import { init } from "./game";
import { input } from "./input";
import { draw } from "./renderer";

init();

document.addEventListener("keydown", input);
window.addEventListener("resize", draw);

draw();
