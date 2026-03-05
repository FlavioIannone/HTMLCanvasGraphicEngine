import Vector2 from "../../Vectors/Vector2.js";
import {
  Binding,
  ButtonBinding,
  CompositeBinding,
  OneDimensionalAxisBinding,
  VectorBinding,
} from "./Bindings.js";

export enum ControlType {
  Vector2,
  Integer,
}

export enum ActionType {
  Value,
  Button,
}

/**
 * Represents a logical action (e.g., "Jump", "Movement").
 * Tracks state, accumulation of vectors, and frame-specific edge cases.
 */
export class InputAction {
  private _actionName: string;
  private _actionType: ActionType;
  private _bindings: Binding[];

  // Flag to determine if this action should reset to zero every frame (e.g., Mouse movement)
  private _isDelta: boolean;

  private _delta: Vector2 | null = null;
  private _normalizedDelta: Vector2 | null = null;
  private _isPressed: boolean = false;

  private _wasPressedThisFrame: boolean = false;
  private _wasReleasedThisFrame: boolean = false;

  constructor(
    actionName: string,
    actionType: ActionType,
    isDelta: boolean = false,
  ) {
    this._actionName = actionName;
    this._actionType = actionType;
    this._isDelta = isDelta; // True for mouse look, false for WASD movement

    if (actionType === ActionType.Button) {
      this._bindings = new Array<ButtonBinding>();
    } else {
      // It can hold both composites (WASD) and raw vectors (Mouse)
      this._bindings = new Array<Binding>();
    }

    if (actionType === ActionType.Value) {
      this._delta = new Vector2(0, 0);
      this._normalizedDelta = new Vector2(0, 0);
    }
  }

  public get actionName(): string {
    return this._actionName;
  }
  public get actionType(): ActionType {
    return this._actionType;
  }
  public get isPressed(): boolean {
    return this._isPressed;
  }
  public get bindings(): Readonly<Binding[]> {
    return this._bindings;
  }

  public get wasPressedThisFrame(): boolean {
    return this._wasPressedThisFrame;
  }
  public get wasReleasedThisFrame(): boolean {
    return this._wasReleasedThisFrame;
  }

  /**
   * Retrieves the NORMALIZED direction.
   * Use this for WASD movement to prevent faster diagonal speed.
   */
  public get delta(): Readonly<Vector2 | null> {
    if (this._delta && this._normalizedDelta) {
      this._normalizedDelta.x = this._delta.x;
      this._normalizedDelta.y = this._delta.y;
      this._normalizedDelta.normalize();
      return this._normalizedDelta;
    }
    return null;
  }

  /**
   * Retrieves the RAW, un-normalized values.
   * CRITICAL: Use this for Mouse movement to preserve user swipe speed/distance.
   */
  public get rawDelta(): Readonly<Vector2 | null> {
    return this._delta;
  }

  public get axis(): number | null {
    if (this._delta) {
      return this._delta.x;
    }
    return null;
  }

  public attachBinding(binding: Binding): void {
    if (
      this._actionType === ActionType.Button &&
      binding instanceof ButtonBinding
    ) {
      this._bindings.push(binding);
    } else if (
      this._actionType === ActionType.Value &&
      (binding instanceof CompositeBinding ||
        binding instanceof VectorBinding ||
        binding instanceof OneDimensionalAxisBinding)
    ) {
      this._bindings.push(binding);
    } else {
      throw new Error(
        `Binding mismatch. ActionType: ${this._actionType}, Binding: ${typeof binding}`,
      );
    }
  }

  public attachBindings(bindings: Binding[]): void {
    for (let i = 0; i < bindings.length; i++) {
      this.attachBinding(bindings[i]);
    }
  }

  /** Overrides the delta entirely. */
  public setDelta(x: number, y: number) {
    if (this._delta) {
      this._delta.x = x;
      this._delta.y = y;
      return;
    }
    throw new Error(
      "Tried to set delta to an InputAction that is not ActionType.Value.",
    );
  }

  /**
   * Accumulates directional input (useful for composite keys like WASD).
   * Math is strictly additive. Normalization is handled by the getter.
   */
  public sumToDelta(x: number, y: number) {
    if (this._delta) {
      this._delta.x += x;
      this._delta.y += y;
      return;
    }
    throw new Error(
      "Tried to sum delta on an InputAction that is not ActionType.Value.",
    );
  }

  /** Sets the boolean state and triggers single-frame flags. */
  public setIsPressed(b: boolean) {
    if (this._actionType === ActionType.Button) {
      if (b && !this._isPressed) {
        this._wasPressedThisFrame = true;
      } else if (!b && this._isPressed) {
        this._wasReleasedThisFrame = true;
      }

      this._isPressed = b;
      return;
    }
    throw new Error(
      "Tried to set isPressed to an InputAction that is not a button.",
    );
  }

  /** Resets single-frame states. Called internally by the engine. */
  public resetFrameState(): void {
    this._wasPressedThisFrame = false;
    this._wasReleasedThisFrame = false;

    // Stop the "Infinite Spin" illusion
    if (this._isDelta && this._delta) {
      this._delta.x = 0;
      this._delta.y = 0;
    }
  }
}
