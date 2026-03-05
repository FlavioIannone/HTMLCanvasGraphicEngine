import Cube from "./GameObjects/Cube.js";
import Camera from "./lib/Camera/Camera.js";
import Engine from "./lib/Engine.js";
import { InputAction } from "./lib/utils/InputManager/InputAction/InputAction.js";
import { InputManager } from "./lib/utils/InputManager/InputManager.js";
import Time from "./lib/utils/Time.js";
import Vector3 from "./lib/utils/Vectors/Vector3.js";

// Global references to game entities and input actions
let cube: Cube;
let lookAction: InputAction;
let movementAction: InputAction;
let upDownAction: InputAction;

// Movement configuration
const speed = 10;
const lookSpeed = 0.05;

/**
 * Phase 1: Awake
 * Initializes the core Engine subsystems and instantiates fundamental
 * GameObjects before any logic or rendering occurs.
 */
const awake = () => {
  Engine.awake();

  // We place it at the origin (0,0,0) looking straight ahead.
  new Camera(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
};

/**
 * Phase 2: Start
 * Executed exactly once before the first frame.
 * Safe for retrieving input bindings and building the scene graph.
 */
const start = () => {
  Engine.start();

  // Retrieve input actions. We use non-null assertions (!) here because
  // InputManager.init() guarantees these bindings exist in our current architecture.
  movementAction = InputManager.getAction("Movement")!;
  lookAction = InputManager.getAction("Look")!;
  upDownAction = InputManager.getAction("Up/Down")!;

  // Spawn a cube 5 units in front of the camera
  cube = new Cube(new Vector3(0, 0, 5), new Vector3(), new Vector3(1, 1, 1));
};

/**
 * Phase 3: Main Game Loop
 * Executed once per frame. Handles physics, input routing, and rendering scheduling.
 * @param time High-resolution timestamp passed by requestAnimationFrame
 */
const update = (time: number) => {
  Engine.update(time);

  const mouseDelta = lookAction.rawDelta;
  const movementDelta = movementAction.delta;
  const t = Camera.main.transform;

  // --- 1. ROTATION (MOUSE LOOK) ---
  if (mouseDelta) {
    // Pitch (X-axis) and Yaw (Y-axis) rotation.
    // Framerate-independent rotation via Time.deltaTime.
    t.rotate(
      new Vector3(
        mouseDelta.y * lookSpeed * Time.deltaTime,
        mouseDelta.x * lookSpeed * Time.deltaTime,
        0,
      ),
    );
  }

  // --- 2. LOCAL TRANSLATION (WASD FPS MOVEMENT) ---
  if (movementDelta) {
    // Scratchpad vector to accumulate the requested movement direction
    const moveStep = new Vector3(0, 0, 0);

    // Forward/Backward: Move along the Camera's local Z-axis
    if (movementDelta.y !== 0) {
      moveStep.x += t.forward.x * movementDelta.y;
      moveStep.y += t.forward.y * movementDelta.y;
      moveStep.z += t.forward.z * movementDelta.y;
    }

    // Left/Right Strafe: Move along the Camera's local X-axis
    if (movementDelta.x !== 0) {
      moveStep.x += t.right.x * movementDelta.x;
      moveStep.y += t.right.y * movementDelta.x;
      moveStep.z += t.right.z * movementDelta.x;
    }

    // STRICT FPS CONTROLLER MECHANIC:
    // Flatten the movement vector onto the XZ plane to prevent the player
    // from flying into the sky or sinking into the ground when looking up/down.
    moveStep.y = 0;

    // MATH FIX: Diagonal Speed Bug
    // We must normalize the flattened vector. Otherwise, pressing W + D
    // results in a vector magnitude of ~1.41, making diagonal movement 41% faster.
    moveStep.normalize();

    // Apply absolute movement speed and delta time to the normalized direction
    moveStep.x *= speed * Time.deltaTime;
    moveStep.y *= speed * Time.deltaTime;
    moveStep.z *= speed * Time.deltaTime;

    t.translate(moveStep);
  }

  // --- 3. GLOBAL VERTICAL MOVEMENT (GOD MODE / JUMP / CROUCH) ---
  if (upDownAction.axis && upDownAction.axis !== 0) {
    // This translates strictly along the World's absolute Y-axis,
    // ignoring where the camera is currently looking.
    t.translate(new Vector3(0, upDownAction.axis * speed * Time.deltaTime, 0));
  }

  // --- 4. RENDER PIPELINE ---
  // The Cube is updated and rendered ONLY AFTER the camera has finished
  // calculating its final position and View Matrix for this frame.
  cube.update();

  // --- 5. CLEANUP ---
  // Wipes instantaneous input deltas (like mouse movement) so they don't
  // carry over indefinitely to the next frame.
  InputManager.clearFrame();
  requestAnimationFrame(update);
};

// Bootstrap the Engine Lifecycle
awake();
requestAnimationFrame((time) => {
  start();
  update(time);
});
