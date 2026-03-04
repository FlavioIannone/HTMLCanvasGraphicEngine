import InputMap from "../../../InputMap.js";
import Engine from "../../Engine.js";
import { ActionType, InputAction } from "./InputAction/InputAction.js";
import KeyCode from "./KeyCode.js";

export type InputMapType = InputAction[];

/**
 * Internal structure to store pre-calculated instructions for each hardware key.
 * Completely eliminates the need for any complex logic inside the DOM event listeners.
 */
type KeyTarget = {
  action: InputAction;
  isButton: boolean;
  deltaX: number; // Applied only if ActionType is Value
  deltaY: number; // Applied only if ActionType is Value
};

/**
 * Singleton managing all active InputActions.
 * Routes hardware DOM events into logical InputAction instances in O(1) time.
 */
export class InputManager {
  private static _instance: InputManager | null = null;
  private static _enabled: boolean = false;
  private static _isPointerLocked: boolean = false;
  private static _inputActions: InputAction[];

  // O(1) Lookup Map: Maps a physical 'keyCode' to an array of pre-configured targets.
  private static _keyMap: Map<string, KeyTarget[]> = new Map();

  // Tracks physically held keys to prevent OS auto-repeat from artificially inflating deltas.
  private static _heldPhysicalKeys: Set<string> = new Set();

  private constructor() {
    if (!InputManager._instance) {
      InputManager._instance = this;
    }
    return InputManager._instance;
  }

  public static get instance() {
    if (!this._instance) throw new Error("InputManager not instantiated.");
    return InputManager._instance;
  }

  public static instantiate() {
    InputManager._instance = new InputManager();
  }

  /** Retrieves a specific InputAction by its name.
   * @param actionName The name of the action to retrieve.
   */
  public static getAction(actionName: string) {
    return this._inputActions.find((v) => v.actionName === actionName);
  }

  /**
   * Initializes DOM listeners and pre-compiles the InputMap into a high-performance Hash Map.
   */
  public static init() {
    this.Enable();
    this._inputActions = InputMap;

    // --- PRE-COMPILATION PHASE ---
    for (let i = 0; i < this._inputActions.length; i++) {
      const action = this._inputActions[i];

      if (action.actionType === ActionType.Button) {
        action.bindings.forEach((b) => {
          const code = b.inputPath.keyCode;
          if (code) {
            if (!this._keyMap.has(code)) this._keyMap.set(code, []);
            this._keyMap
              .get(code)!
              .push({ action, isButton: true, deltaX: 0, deltaY: 0 });
          }
        });
      } else if (action.actionType === ActionType.Value) {
        action.bindings.forEach((b) => {
          // 1. Handle composite
          const comp = b.inputPath.composite;
          if (comp) {
            // Helper function to map a composite direction
            const registerDirection = (
              code: string | undefined,
              x: number,
              y: number,
            ) => {
              if (code) {
                if (!this._keyMap.has(code)) this._keyMap.set(code, []);
                this._keyMap
                  .get(code)!
                  .push({ action, isButton: false, deltaX: x, deltaY: y });
              }
            };

            // Map standard 2D cartesian axes (WASD style)
            registerDirection(comp.up, 0, 1);
            registerDirection(comp.down, 0, -1);
            registerDirection(comp.left, -1, 0);
            registerDirection(comp.right, 1, 0);
          }

          // 2. Handle direct vectors
          const code = b.inputPath.keyCode;
          if (code) {
            if (!this._keyMap.has(code)) this._keyMap.set(code, []);
            this._keyMap
              .get(code)!
              .push({ action, isButton: false, deltaX: 0, deltaY: 0 });
          }
        });
      }
    }

    // --- DOM EVENT LISTENERS ---
    document.addEventListener("keydown", (e) => {
      if (!this._enabled) return;

      // Filter out auto-repeated events to protect vector math
      if (this._heldPhysicalKeys.has(e.code)) return;
      this._heldPhysicalKeys.add(e.code);

      const targets = this._keyMap.get(e.code);
      if (targets) {
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i];
          if (t.isButton) {
            t.action.setIsPressed(true);
          } else {
            t.action.sumToDelta(t.deltaX, t.deltaY);
          }
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!this._enabled) return;

      this._heldPhysicalKeys.delete(e.code);

      const targets = this._keyMap.get(e.code);
      if (targets) {
        for (let i = 0; i < targets.length; i++) {
          const t = targets[i];
          if (t.isButton) {
            t.action.setIsPressed(false);
          } else {
            // Subtract the exact delta to reverse the movement seamlessly
            t.action.sumToDelta(-t.deltaX, -t.deltaY);
          }
        }
      }
    });

    // --- MOUSE EVENT LISTENER ---
    document.addEventListener("mousemove", (e) => {
      if (!this._enabled) return;

      // In 3D games, we only read mouse movement if the cursor is locked to the canvas.
      if (!this._isPointerLocked) return;

      // We look up whatever action is bound to our virtual MouseDelta string
      const targets = this._keyMap.get(KeyCode.MouseDelta);
      if (targets) {
        for (let i = 0; i < targets.length; i++) {
          // Feed the raw pixel movement directly into the action's accumulator
          targets[i].action.sumToDelta(e.movementX, e.movementY);
        }
      }
    });

    document.addEventListener("pointerlockchange", () => {
      this._isPointerLocked = document.pointerLockElement !== null;
    });
  }

  // Example method to request lock
  public static requestPointerLock() {
    Engine.canvas.requestPointerLock();
  }

  public static Enable() {
    this._enabled = true;
  }

  public static Disable() {
    this._enabled = false;
    this._heldPhysicalKeys.clear();
  }

  /**
   * Flushes single-frame states. Must be called at the end of the game loop.
   */
  public static clearFrame(): void {
    for (let i = 0; i < this._inputActions.length; i++) {
      this._inputActions[i].resetFrameState();
    }
  }
}
