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
let movementAction: InputAction;
// Start is called only on the first frame
const start = () => {
  Engine.start();
  window.addEventListener("resize", Engine.onWindowResize);
  window.addEventListener("focus", InputManager.requestPointerLock);
  movementAction = InputManager.getAction("Movement")!;
  lookAction = InputManager.getAction("Look")!;
};
const speed = 10;
// Update is called once for each frame
const update = (time: number) => {
  Engine.update(time);
  cube.update();
  const mouseDelta = lookAction.rawDelta;
  const movementDelta = movementAction.delta;
  cube.transform.rotate(
    new Vector3(
      (mouseDelta!.y / 10) * Time.deltaTime,
      -(mouseDelta!.x / 10) * Time.deltaTime,
      0,
    ),
  );
  cube.transform.translate(
    new Vector3(
      movementDelta!.x * speed * Time.deltaTime,
      0,
      movementDelta!.y * speed * Time.deltaTime,
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
