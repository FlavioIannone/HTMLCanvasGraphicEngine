import Transform from "../Components/Transform.js";
import { Matrix4 } from "../utils/Matrices/Matrix4.js";
import Vector3 from "../utils/Vectors/Vector3.js";

/**
 * Represents the mathematical "Eye" of the 3D engine.
 * The Camera does not physically move through the world; instead, it generates
 * a View Matrix (LookAt) that is used by the Renderer to pull the entire universe
 * in the opposite direction, creating the illusion of 3D navigation.
 */
export default class Camera {
  // The cached View Matrix. Applied to all vertices to shift them from World Space to Camera Space.
  private _lookAtMatrix: Matrix4 = new Matrix4();

  // --- STATE CACHING (Zero-Allocation Dirty Checking) ---
  // Instead of relying on manual boolean flags from the Transform, the Camera hashes
  // its last known spatial state. This allows it to autonomously detect changes
  // without coupling tightly to the Transform's internal logic.
  private _lastKnownPosition: Vector3 = new Vector3();
  private _lastKnownRotation: Vector3 = new Vector3();

  // The spatial representation of the Camera.
  // Exposed as a readonly reference so external controllers can translate/rotate it.
  private _transform: Transform;

  // Global Singleton instance for easy access across the engine.
  private static _mainCamera: Camera | null = null;

  // Pre-allocated vector used to calculate the "Target" point during the LookAt math.
  // CRITICAL: Prevents Garbage Collection pauses by avoiding 'new Vector3()' every frame.
  private _atScratchpad: Vector3 = new Vector3();

  /**
   * Initializes a new Camera object.
   * @param position The absolute World Space coordinates.
   * @param rotation The Euler angles (Pitch, Yaw, Roll) representing the gaze direction.
   */
  constructor(position: Vector3, rotation: Vector3) {
    // Scale is strictly set to (1, 1, 1) as camera scaling is mathematically invalid
    // for standard View Matrix generation.
    this._transform = new Transform(position, rotation, new Vector3(1, 1, 1));

    // Automatically assign the first instantiated camera as the Main Camera.
    if (!Camera._mainCamera) {
      Camera._mainCamera = this;
    }

    // Force the initial generation of the matrix to prevent rendering a blank frame.
    this.forceRecalculate();
  }

  /**
   * Retrieves the global active Main Camera.
   * @throws Error if accessed before any camera is instantiated.
   */
  public static get main(): Camera {
    if (!Camera._mainCamera)
      throw new Error(
        "Tried to access the main camera, but the main camera is not instantiated.",
      );
    return Camera._mainCamera;
  }

  /**
   * Provides access to the Camera's Transform.
   * Controllers should use this to apply movement (translate) and mouse look (rotate).
   */
  public get transform(): Transform {
    return this._transform;
  }

  /**
   * Retrieves the View Matrix for the current frame.
   * Employs Lazy Evaluation: the heavy trigonometric matrix math is only executed
   * if the Camera actually moved or rotated since the last frame.
   * @returns The 4x4 View Matrix (LookAt).
   */
  public getLookAtMatrix(): Matrix4 {
    // Check if the current Transform state deviates from the cached state.
    // Uses direct primitive comparisons to ensure zero memory allocation.
    if (
      !Vector3.isEqual(this._transform.position, this._lastKnownPosition) ||
      !Vector3.isEqual(this._transform.rotation, this._lastKnownRotation)
    ) {
      this.forceRecalculate();
    }

    return this._lookAtMatrix;
  }

  /**
   * Performs the heavy linear algebra to generate the LookAt matrix.
   * Updates the internal cache to prevent redundant calculations in future frames.
   */
  private forceRecalculate(): void {
    // 1. Determine the Target Point (Where is the camera looking?)
    // Target = Current Position + Forward Direction Vector
    Vector3.sum(
      this._transform.position,
      this._transform.forward,
      this._atScratchpad,
    );

    // 2. Generate the View Matrix
    // Aligns the universe to the Camera's local axes (Forward, Right, Up) and
    // applies the inverse translation.
    Matrix4.makeLookAtMatrix4(
      this._transform.position,
      this._atScratchpad,
      this._lookAtMatrix,
    );

    // 3. Update State Cache
    // Sync the known state with the current state to satisfy the lazy evaluation check.
    this._lastKnownPosition.x = this._transform.position.x;
    this._lastKnownPosition.y = this._transform.position.y;
    this._lastKnownPosition.z = this._transform.position.z;

    this._lastKnownRotation.x = this._transform.rotation.x;
    this._lastKnownRotation.y = this._transform.rotation.y;
    this._lastKnownRotation.z = this._transform.rotation.z;
  }
}
