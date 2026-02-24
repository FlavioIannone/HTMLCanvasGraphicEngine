import config from "./game.config.js";
import Time from "./lib/utils/Time.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas element not found");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas context not found");
canvas.width = config.width;
canvas.height = config.height;

const clear = () => {
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Awake is called before the game starts
const awake = () => {
  Time.instantiate();
};

// Start is called only on the first frame
const start = () => {
  if (!Time.instance) {
    console.log("Error, Time not instantiated.");
    return;
  }
};

// Update is called once for each frame
const update = (time: number) => {
  clear();
  Time.update(time);

  requestAnimationFrame(update);
};

awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
