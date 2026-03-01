import config from "../../../game.config.js";
import { Matrix4 } from "../Matrices/Matrix4.js";
import Vector2 from "../Vectors/Vector2.js";
import Vector3 from "../Vectors/Vector3.js";
import Vector4 from "../Vectors/Vector4.js";

/**
 * Manages screen space transformations, aspect ratio, and the projection matrix.
 * Implements a Singleton pattern and strictly uses pre-allocated memory (scratchpads)
 * to prevent Garbage Collection pauses during the rendering loop.
 */
export default class Screen {
  private static _instance: Screen | null = null;

  // The cached projection matrix
  private static _projectionMatrix = this.getProjectionMatrix();

  // Pre-allocated scratchpads for matrix and vector math.
  // CRITICAL: We reuse these exact instances for every single vertex to avoid memory leaks.
  private static temp_res: Vector4 = new Vector4(0, 0, 0, 1);
  private static temp_v4: Vector4 = new Vector4(0, 0, 0, 1);
  private static temp_v2: Vector2 = new Vector2();

  /**
   * Retrieves the Singleton instance.
   * @throws Error if not instantiated.
   */
  public static get instance(): Screen {
    if (!this._instance) throw Error("ScreenCoordinates not instantiated");
    return this._instance;
  }

  private constructor() {
    if (!Screen._instance) {
      Screen._instance = this;
    }
    return Screen._instance;
  }

  public static instantiate() {
    Screen._instance = new Screen();
  }

  /**
   * Forces a recalculation of the projection matrix.
   * Should be called ONLY when the screen is resized or FOV changes.
   */
  public static updateProjectionMatrix() {
    this._projectionMatrix = this.getProjectionMatrix();
  }

  /**
   * Computes the aspect ratio.
   * @returns The aspect ratio
   */
  public static getAspectRatio(): number {
    return config.screenConfig.width / config.screenConfig.height;
  }

  /**
   * Computes the 4x4 Perspective Projection matrix.
   * Maps 3D camera space into a Normalized Device Coordinates (NDC) space.
   * @returns A new populated Matrix4
   */
  private static getProjectionMatrix(): Matrix4 {
    const m = new Matrix4();
    // Convert FOV from degrees to radians, then calculate the scaling factor
    const f = 1 / Math.tan((config.screenConfig.fov * (Math.PI / 180)) / 2);
    const lambda =
      config.screenConfig.z_far /
      (config.screenConfig.z_far - config.screenConfig.z_near);

    // Using 1D flat array mapping for performance (Row-Major)
    m.matrix[0] = f / Screen.getAspectRatio(); // [0][0] - Scale X by aspect ratio
    m.matrix[5] = f; // [1][1] - Scale Y by FOV
    m.matrix[10] = lambda; // [2][2] - Scale Z to fit near/far planes
    m.matrix[11] = -lambda * config.screenConfig.z_near; // [2][3] - Translate Z based on near plane
    m.matrix[14] = 1; // [3][2] - Save Z into W for perspective divide
    m.matrix[15] = 0; // [3][3] - Clear the default 1 from identity

    return m;
  }

  /**
   * Projects a 3D point into the 2D space using the projection matrix.
   * Uses internal scratchpads to prevent memory allocation.
   * @param p The 3D point in world/camera space.
   * @returns The projected 2D point (reference to internal scratchpad).
   */
  public static project(p: Vector3): Vector2 {
    // 1. Load data into temp vector
    this.temp_v4.x = p.x;
    this.temp_v4.y = p.y;
    this.temp_v4.z = p.z;
    this.temp_v4.w = 1;

    // 2. Multiply by projection matrix
    Matrix4.matrix4MultiplyVector4(
      this.temp_v4,
      this._projectionMatrix,
      this.temp_res,
    );

    // 3. Perform Perspective Divide (if w is not 0)
    if (this.temp_res.w !== 0) {
      this.temp_v2.x = this.temp_res.x / this.temp_res.w;
      this.temp_v2.y = this.temp_res.y / this.temp_res.w;
    } else {
      this.temp_v2.x = this.temp_res.x;
      this.temp_v2.y = this.temp_res.y;
    }

    return this.temp_v2;
  }

  /**
   * Converts a point from Normalized Device Coordinates (NDC) to Screen Space (Pixels).
   * Maps the point to the canvas dimensions and handles Y-axis inversion.
   * It does not create new memory.
   * @param p - A point in NDC space (x: -1 to 1, y: -1 to 1).
   * @returns The same mutated point in Screen Space.
   */
  public static toScreen(p: Vector2): Vector2 {
    p.x = ((p.x + 1) / 2) * config.screenConfig.width;
    p.y = (1 - (p.y + 1) / 2) * config.screenConfig.height;
    return p; // Returning the mutated input
  }
}
