import config from "./game.config.js";
import Cube from "./GameObjects/Cube.js";
import Engine from "./lib/Engine.js";
import Screen from "./lib/utils/CoordinatesManagers/Screen.js";
import Time from "./lib/utils/Time.js";
import Vector3 from "./lib/utils/Vectors/Vector3.js";

// Awake is called before the game starts
const awake = () => {
  Engine.awake();
};

// Start is called only on the first frame
const start = () => {
  Engine.start();
  window.addEventListener("resize", Engine.onWindowResize);
};

const cube = new Cube(
  new Vector3(0, 0, 4),
  new Vector3(),
  new Vector3(1, 1, 1),
);

// Update is called once for each frame
const update = (time: number) => {
  Engine.update(time);
  cube.update();

  requestAnimationFrame(update);
};

awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
