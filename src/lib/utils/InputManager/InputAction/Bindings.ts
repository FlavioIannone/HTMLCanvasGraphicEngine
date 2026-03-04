import KeyCode from "../KeyCode.js";

type Composite = {
  up: KeyCode;
  down: KeyCode;
  left: KeyCode;
  right: KeyCode;
};

class InputPath {
  private _isComposite: boolean;
  private _keyCode?: KeyCode;
  private _composite?: Composite;

  constructor(key?: KeyCode, composite?: Composite) {
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
  public get composite(): Composite | undefined {
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

export class CompositeBinding implements Binding {
  inputPath: InputPath;
  constructor(composite: Composite) {
    this.inputPath = new InputPath(undefined, composite);
  }
}

export class VectorBinding implements Binding {
  inputPath: InputPath;
  constructor(key: KeyCode) {
    this.inputPath = new InputPath(key, undefined);
  }
}
