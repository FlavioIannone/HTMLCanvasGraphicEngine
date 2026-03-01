import config from "./game.config.js";
import Cube from "./GameObjects/Cube.js";
import Engine from "./lib/Engine.js";
import Screen from "./lib/utils/CoordinatesManagers/Screen.js";
import Time from "./lib/utils/Time.js";
import Vector3 from "./lib/utils/Vectors/Vector3.js";

const clear = () => {
  Engine.context.fillStyle = config.backgroundColor;
  Engine.context.fillRect(
    0,
    0,
    config.screenConfig.width,
    config.screenConfig.height,
  );
};

// Awake is called before the game starts
const awake = () => {
  Engine.instantiate();
  Time.instantiate();
  Screen.instantiate();
};

// Start is called only on the first frame
const start = () => {
  if (!Engine.instance) {
    console.error("Error, Time not instantiated.");
    return;
  }
  if (!Screen.instance) {
    console.error("Error, Time not instantiated.");
    return;
  }
  if (!Time.instance) {
    console.error("Error, Time not instantiated.");
    return;
  }

  window.addEventListener("resize", Engine.onWindowResize);
};

const cube = new Cube(
  new Vector3(0, 0, 4),
  new Vector3(),
  new Vector3(1, 1, 1),
);

// Update is called once for each frame
const update = (time: number) => {
  Engine.update();
  clear();
  Time.update(time);
  cube.update();

  requestAnimationFrame(update);
};

awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
