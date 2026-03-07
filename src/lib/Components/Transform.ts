import MathUtils from "../utils/MathUtils/MathUtils.js";
import { Matrix4 } from "../utils/Matrices/Matrix4.js";
import Vector3 from "../utils/Vectors/Vector3.js";

/**
 * Encapsulates the spatial state of a GameObject, including its translation,
 * rotation, and scale within the 3D world.
 * Manages a local Model Matrix and updates it only when transformations change.
 */
export default class Transform {
  /** The absolute position of the object in world space. */
  private _position: Vector3;

  /** The rotation of the object represented as Euler angles (Pitch, Yaw, Roll) in radians. */
  private _radRotation: Vector3;

  /** The rotation of the object represented as Euler angles (Pitch, Yaw, Roll) in degrees. */
  private _degRotation: Vector3;

  /** The scale/dimensions of the object relative to its local origin. */
  private _scale: Vector3;

  // Cached directional vectors (Zero-Allocation)
  private _forward: Vector3 = new Vector3(0, 0, 1);
  private _right: Vector3 = new Vector3(1, 0, 0);
  private _up: Vector3 = new Vector3(0, 1, 0);

  // Internal matrices used to compose the final rotation
  private _mX: Matrix4 = new Matrix4();
  private _mY: Matrix4 = new Matrix4();
  private _mZ: Matrix4 = new Matrix4();

  // The final transformation matrix and its dirty flag
  private _modelMatrix: Matrix4 = new Matrix4();
  private _isDirty: boolean = true;

  // Scratchpads to prevent Garbage Collection overhead during matrix computation
  private _tempMatT: Matrix4 = new Matrix4();
  private _tempMatR: Matrix4 = new Matrix4();
  private _tempMatS: Matrix4 = new Matrix4();

  /**
   * Initializes a new Transform.
   * Performs a deep copy of the vectors to prevent external reference mutations
   * from silently breaking the dirty flag logic.
   * @param position - Initial world coordinates.
   * @param rotation - Initial orientation in radians.
   * @param scale - Initial scale factors.
   */
  constructor(position: Vector3, rotation: Vector3, scale: Vector3) {
    this._position = new Vector3(position.x, position.y, position.z);
    this._degRotation = new Vector3(rotation.x, rotation.y, rotation.z);
    this._radRotation = new Vector3(
      rotation.x * MathUtils.DEG2RAD,
      rotation.y * MathUtils.DEG2RAD,
      rotation.z * MathUtils.DEG2RAD,
    );
    this._scale = new Vector3(scale.x, scale.y, scale.z);
  }

  // --- GETTERS ---
  // WARNING: The returned Vector3 should be treated as READ-ONLY.
  // Mutating its properties directly (e.g., position.x = 5) will bypass the dirty flag.

  /** Gets the current position vector. Treat as read-only. */
  public get position(): Readonly<Vector3> {
    return this._position;
  }

  /** Gets the current rotation vector in Euler angles. Treat as read-only. */
  public get rotation(): Readonly<Vector3> {
    return this._degRotation;
  }

  public get radRotation(): Readonly<Vector3> {
    return this._radRotation;
  }

  /** Gets the current scale vector. Treat as read-only. */
  public get scale(): Readonly<Vector3> {
    return this._scale;
  }

  /** * The normalized directional vector pointing "Forward" relative to the object's rotation.
   * Essential for Camera LookAt math and character movement.
   */
  public get forward(): Readonly<Vector3> {
    const cy = Math.cos(this._radRotation.y); // Yaw
    const sy = Math.sin(this._radRotation.y);
    const cx = Math.cos(this._radRotation.x); // Pitch
    const sx = Math.sin(this._radRotation.x);

    this._forward.x = sy * cx;
    this._forward.y = -sx;
    this._forward.z = cy * cx;

    // Safety normalization to prevent floating point drift
    this._forward.normalize();
    return this._forward;
  }

  /** The normalized directional vector pointing "Right". */
  public get right(): Readonly<Vector3> {
    const cy = Math.cos(this._radRotation.y);
    const sy = Math.sin(this._radRotation.y);

    // Right vector ignores Pitch (X) for FPS camera stability
    this._right.x = cy;
    this._right.y = 0;
    this._right.z = -sy;

    this._right.normalize();
    return this._right;
  }

  /** The normalized directional vector pointing "Up". */
  public get up(): Readonly<Vector3> {
    // Cross product of Right and Forward guarantees a perfectly orthogonal Up vector
    Vector3.crossProduct(this.right, this.forward, this._up);
    return this._up;
  }

  // --- SETTERS ---
  // These setters guarantee that assigning a new vector flags the matrix for an update.

  /** Sets a new absolute position and marks the transform as dirty. */
  public set position(v: Vector3) {
    this._position.x = v.x;
    this._position.y = v.y;
    this._position.z = v.z;
    this._isDirty = true;
  }

  /** Sets a new absolute rotation and marks the transform as dirty.
   * @param r The new rotation in degrees
   */
  public set rotation(r: Vector3) {
    const degRx = r.x;
    const degRy = r.y;
    const degRz = r.z;
    this._degRotation.x = degRx;
    this._degRotation.y = degRy;
    this._degRotation.z = degRz;
    this._radRotation.x = degRx * MathUtils.DEG2RAD;
    this._radRotation.y = degRy * MathUtils.DEG2RAD;
    this._radRotation.z = degRz * MathUtils.DEG2RAD;
    this._isDirty = true;
  }

  /** Sets a new absolute scale and marks the transform as dirty. */
  public set scale(s: Vector3) {
    this._scale.x = s.x;
    this._scale.y = s.y;
    this._scale.z = s.z;
    this._isDirty = true;
  }

  /**
   * Generates the world matrix (TRS) for this object.
   * Leverages the dirty flag to only recompute mathematical operations when changes occur.
   * * @returns The updated 4x4 Model Matrix.
   */
  public getModelMatrix(): Matrix4 {
    if (this._isDirty) {
      // 1. Generate individual transformation matrices
      Matrix4.makeTranslationMatrix4(this._position, this._tempMatT);
      Matrix4.makeXYZRotationMatrix4(
        this._radRotation,
        this._mX,
        this._mY,
        this._mZ,
        this._tempMatR,
      );
      Matrix4.makeScaleMatrix4(this._scale, this._tempMatS);

      // 2. Combine matrices in TRS order (Translation * Rotation * Scale)
      // First: Rotation * Scale
      Matrix4.multiplyMatrix4(
        this._tempMatR,
        this._tempMatS,
        this._modelMatrix,
      );

      // Second: Translation * (Rotation * Scale)
      Matrix4.multiplyMatrix4(
        this._tempMatT,
        this._modelMatrix,
        this._modelMatrix,
      );

      // 3. Reset the flag until the next mutation
      this._isDirty = false;
    }
    return this._modelMatrix;
  }

  /**
   * Shifts the object's position by the given delta vector.
   * @param delta - The amount to move along the X, Y, and Z axes.
   */
  public translate(delta: Vector3): void {
    this._position.x += delta.x;
    this._position.y += delta.y;
    this._position.z += delta.z;
    this._isDirty = true;
  }

  /**
   * Rotates the object by adding the given delta angles to its current rotation.
   * @param delta - The amount to rotate (in degrees) along the X, Y, and Z axes.
   */
  public rotate(delta: Readonly<Vector3>): void {
    this._degRotation.x += delta.x;
    this._degRotation.y += delta.y;
    this._degRotation.z += delta.z;

    this._degRotation.x = this._degRotation.x;
    this._degRotation.y = this._degRotation.y;
    this._degRotation.z = this._degRotation.z;

    this._radRotation.x = this._degRotation.x * MathUtils.DEG2RAD;
    this._radRotation.y = this._degRotation.y * MathUtils.DEG2RAD;
    this._radRotation.z = this._degRotation.z * MathUtils.DEG2RAD;

    this._isDirty = true;
  }
}
