import Cube from "./GameObjects/Cube.js";
import Engine from "./lib/Engine.js";
import { InputAction } from "./lib/utils/InputManager/InputAction/InputAction.js";
import { InputManager } from "./lib/utils/InputManager/InputManager.js";
import Time from "./lib/utils/Time.js";
import Vector3 from "./lib/utils/Vectors/Vector3.js";

// Awake is called before the game starts
const awake = () => {
  Engine.awake();
};

const cube = new Cube(
  new Vector3(0, 0, 5),
  new Vector3(),
  new Vector3(1, 1, 1),
);
let lookAction: InputAction;
// Start is called only on the first frame
const start = () => {
  Engine.start();
  window.addEventListener("resize", Engine.onWindowResize);
  window.addEventListener("focus", InputManager.requestPointerLock);
  lookAction = InputManager.getAction("Look")!;
};

// Update is called once for each frame
const update = (time: number) => {
  Engine.update(time);
  cube.update();
  const delta = lookAction.rawDelta;
  cube.transform.rotate(
    new Vector3(
      (delta!.y / 10) * Time.deltaTime,
      -(delta!.x / 10) * Time.deltaTime,
      0,
    ),
  );

  InputManager.clearFrame();
  requestAnimationFrame(update);
};

awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
