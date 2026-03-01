import config from "../../../game.config.js";
import { Matrix4 } from "../Matrices/Matrix4.js";
import Vector2 from "../Vectors/Vector2.js";
import Vector3 from "../Vectors/Vector3.js";
import Vector4 from "../Vectors/Vector4.js";

export default class Screen {
  private static _instance: Screen | null = null;
  private static _context: CanvasRenderingContext2D | null = null;
  private static _projectionMatrix = this.getProjectionMatrix();

  // Allocated memory for projection operations
  private static temp_res: Vector4 = new Vector4(0, 0, 0, 1);
  private static temp_v4: Vector4 = new Vector4(0, 0, 0, 1);
  private static temp_v2: Vector2 = new Vector2();

  public static get instance(): Screen {
    if (!this._instance) throw Error("ScreenCoordinates not instantiated");
    return this._instance;
  }

  public static get context(): CanvasRenderingContext2D {
    if (!this._context) throw Error("The rendering context is null");
    return this._context;
  }

  private constructor(context: CanvasRenderingContext2D) {
    if (!Screen._instance) {
      Screen._instance = this;
      Screen._context = context;
    }
    return Screen._instance;
  }

  public static instantiate(context: CanvasRenderingContext2D) {
    Screen._instance = new Screen(context);
  }

  public static updateProjectionMatrix() {
    this._projectionMatrix = this.getProjectionMatrix();
  }

  /**
   * Computes the aspect ratio, defined as width/height
   * @returns The aspect ratio
   */
  public static getAspectRatio(): number {
    return config.screenConfig.width / config.screenConfig.height;
  }

  /**
   * Computes the 4x4 projection matrix.
   * @returns The 4x4 projection matrix
   */
  private static getProjectionMatrix(): Matrix4 {
    const m = new Matrix4();
    const f = 1 / Math.tan((config.screenConfig.fov * (Math.PI / 180)) / 2);
    const lambda =
      config.screenConfig.z_far /
      (config.screenConfig.z_far - config.screenConfig.z_near);

    m.matrix[0] = f / Screen.getAspectRatio();
    m.matrix[5] = f;
    m.matrix[10] = lambda;
    m.matrix[11] = -lambda * config.screenConfig.z_near;
    m.matrix[14] = 1;
    m.matrix[15] = 0;

    return m;
  }

  /**
   * Projects a 3D point into the 2D space of the screen using the projection matrix
   * @param p point to project
   * @returns the projected point
   */
  public static project(p: Vector3): Vector2 {
    this.temp_v4.x = p.x;
    this.temp_v4.y = p.y;
    this.temp_v4.z = p.z;
    this.temp_v4.w = 1;
    Matrix4.matrix4MultiplyVector4(
      this.temp_v4,
      this._projectionMatrix,
      this.temp_res,
    );

    this.temp_v2.x = this.temp_res.x;
    this.temp_v2.y = this.temp_res.y;

    if (this.temp_res.w !== 0) {
      this.temp_v2.x = this.temp_res.x / this.temp_res.w;
      this.temp_v2.y = this.temp_res.y / this.temp_res.w;
    }

    return this.temp_v2;
  }

  /**
   * Converts a point from Normalized Device Coordinates (NDC) to Screen Space (Pixels).
   * * Input Assumption:
   * The input point 'p' must be in the range [-1, 1].
   * - (-1, -1) is Bottom-Left in 3D space.
   * - (1, 1) is Top-Right in 3D space.
   *
   * Maps the point to the canvas pixel dimensions, handling the Y-axis inversion.
   * @param p - A point in NDC space (x: -1 to 1, y: -1 to 1).
   * @returns A point in Screen Space (x: 0 to width, y: 0 to height).
   */
  public static toScreen(p: Vector2): Vector2 {
    return new Vector2(
      ((p.x + 1) / 2) * config.screenConfig.width,
      (1 - (p.y + 1) / 2) * config.screenConfig.height,
    );
  }
}
