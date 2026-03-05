import KeyCode from "../KeyCode.js";

// Define strict shapes for 2D and 1D composites
export type Composite2D = {
  up: KeyCode;
  down: KeyCode;
  left: KeyCode;
  right: KeyCode;
};

export type Composite1D = {
  positive: KeyCode;
  negative: KeyCode;
};

export class InputPath {
  private _isComposite: boolean;
  private _keyCode?: KeyCode;

  // Use a Union Type to allow either a 1D or a 2D composite structure
  private _composite?: Composite2D | Composite1D;

  constructor(key?: KeyCode, composite?: Composite2D | Composite1D) {
    this._isComposite = composite !== undefined;
    this._keyCode = key;
    this._composite = composite;
  }

  public get isComposite(): boolean {
    return this._isComposite;
  }
  public get keyCode(): KeyCode | undefined {
    return this._keyCode;
  }
  public get composite(): Composite2D | Composite1D | undefined {
    return this._composite;
  }
}

export interface Binding {
  inputPath: InputPath;
}

export class ButtonBinding implements Binding {
  inputPath: InputPath;

  constructor(key: KeyCode) {
    this.inputPath = new InputPath(key, undefined);
  }
}

export class VectorBinding implements Binding {
  inputPath: InputPath;
  constructor(key: KeyCode) {
    this.inputPath = new InputPath(key, undefined);
  }
}

export class CompositeBinding implements Binding {
  inputPath: InputPath;
  constructor(composite: Composite2D) {
    this.inputPath = new InputPath(undefined, composite);
  }
}

/**
 * Maps an axis with two opposing directions (e.g., Forward/Backward or Left/Right).
 * Represents a 1D vector accumulation.
 */
export class OneDimensionalAxisBinding implements Binding {
  inputPath: InputPath;

  // Maps strictly to a positive and negative KeyCode
  constructor(axis: Composite1D) {
    this.inputPath = new InputPath(undefined, {
      positive: axis.positive,
      negative: axis.negative,
    });
  }
}
