import Vector2 from "../../Vectors/Vector2.js";
import {
  Binding,
  ButtonBinding,
  CompositeBinding,
  Axis1DBinding,
  VectorBinding,
} from "./Bindings.js";

export enum Processor {
  Vector2,
  NormalizedVector2,
  DigitalNormalizedVector2,
}

export enum ActionType {
  Value,
  Delta,
  Button,
}

/**
 * Represents a logical action (e.g., "Jump", "Movement").
 * Tracks state, accumulation of vectors, and frame-specific edge cases.
 */
export class InputAction {
  private _actionName: string;
  private _actionType: ActionType;
  private _processor?: Processor;
  private _bindings: Binding[];

  private _delta: Vector2 | null = null;
  private _normalizedDelta: Vector2 | null = null;
  private _digitalNormalizedDelta: Vector2 | null = null;
  private _isPressed: boolean = false;

  private _wasPressedThisFrame: boolean = false;
  private _wasReleasedThisFrame: boolean = false;

  constructor(
    actionName: string,
    actionType: ActionType,
    processor?: Processor,
  ) {
    this._actionName = actionName;
    this._actionType = actionType;
    this._processor = processor;

    if (actionType === ActionType.Button) {
      this._bindings = new Array<ButtonBinding>();
    } else {
      // It can hold both composites (WASD) and raw vectors (Mouse)
      this._bindings = new Array<Binding>();
    }

    if (actionType == ActionType.Value || actionType == ActionType.Delta) {
      this._delta = new Vector2(0, 0);
      this._normalizedDelta = new Vector2(0, 0);
      this._digitalNormalizedDelta = new Vector2(0, 0);
    }
  }

  public get actionName(): string {
    return this._actionName;
  }
  public get actionType(): ActionType {
    return this._actionType;
  }
  public get bindings(): Readonly<Binding[]> {
    return this._bindings;
  }

  public get isPressed(): boolean {
    return this._isPressed;
  }

  public get wasPressedThisFrame(): boolean {
    return this._wasPressedThisFrame;
  }
  public get wasReleasedThisFrame(): boolean {
    return this._wasReleasedThisFrame;
  }

  /**
   * Preprocesses the delta:
   * - If the Processor == Processor.DigitalNormalizedVector2 -> returns the delta normilized digitally
   * - If the Processor == Processor.NormalizedVector2 -> returns the delta normilized
   * - If the Processor == Processor.Vector2 -> returns the raw delta
   * Use this for WASD movement to prevent faster diagonal speed.
   */
  public get delta(): Readonly<Vector2 | null> {
    if (this._delta && this._normalizedDelta && this._digitalNormalizedDelta) {
      if (this._processor == Processor.DigitalNormalizedVector2) {
        this._digitalNormalizedDelta.x = this._delta.x;
        this._digitalNormalizedDelta.y = this._delta.y;
        this._digitalNormalizedDelta.digitalNormalize();
      }
      if (this._processor == Processor.NormalizedVector2) {
        this._normalizedDelta.x = this._delta.x;
        this._normalizedDelta.y = this._delta.y;
        this._normalizedDelta.normalize();
      }
      return this._delta;
    }
    return null;
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
      (this._actionType === ActionType.Value ||
        this._actionType == ActionType.Delta) &&
      (binding instanceof CompositeBinding ||
        binding instanceof VectorBinding ||
        binding instanceof Axis1DBinding)
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
    if (this._actionType == ActionType.Delta && this._delta) {
      this._delta.x = 0;
      this._delta.y = 0;
    }
  }
}
