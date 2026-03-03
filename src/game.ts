import Cube from "./GameObjects/Cube.js";
import Engine from "./lib/Engine.js";
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

const cube1 = new Cube(
  new Vector3(5, -2, 5),
  new Vector3(),
  new Vector3(1, 1, 1),
);

const cube2 = new Cube(
  new Vector3(-10, 0, 15),
  new Vector3(),
  new Vector3(1, 1, 1),
);

// Update is called once for each frame
const update = (time: number) => {
  Engine.update(time);
  cube1.update();
  cube2.update();

  cube1.transform.rotate(new Vector3(0, -(Math.PI / 4) * Time.deltaTime, 0));
  cube1.transform.translate(new Vector3(0, Math.sin(Time.time) / 70, 0));

  cube2.transform.rotate(new Vector3(0, -Math.PI * Time.deltaTime, 0));
  cube2.transform.translate(new Vector3(0, Math.sin(Time.time + 672) / 10, 0));

  requestAnimationFrame(update);
};

awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
