import Transform from "../../Components/Transform.js";
import Vector3 from "../Vectors/Vector3.js";
import Vector4 from "../Vectors/Vector4.js";

/**
 * Represents a 4x4 Matrix built specifically for High-Performance CPU rendering.
 * * ARCHITECTURAL DECISIONS:
 * 1. Float32Array: Ensures contiguous memory blocks for cache-friendly SIMD optimization.
 * 2. Row-Major Layout: Vectors are treated as column vectors multiplied on the right (M * v).
 * Translations are explicitly stored in the last column (indices 3, 7, 11).
 * 3. Zero-Allocation: Relies entirely on mutating pre-existing arrays.
 */
export class Matrix4 {
  public entries: Float32Array;

  // Static scratchpads dedicated exclusively to LookAt matrix axis generation.
  // Prevents instantiating 3 new vectors every time the camera moves.
  private static X: Vector3 = new Vector3();
  private static Y: Vector3 = new Vector3();
  private static Z: Vector3 = new Vector3();

  constructor() {
    // Initializes as an Identity Matrix (neutral transformation state)
    this.entries = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
  }

  public static get identity() {
    return new Matrix4();
  }

  public static resetToIdentity(out: Matrix4) {
    out.entries.fill(0);
    out.entries[0] = 1;
    out.entries[5] = 1;
    out.entries[10] = 1;
    out.entries[15] = 1;
  }

  /**
   * Multiplies a 4x4 matrix by a 4D vector (M * v).
   * Includes Anti-Aliasing protection: local constants cache the input vector
   * so 'out' can safely reference the exact same object in memory as 'v'.
   */
  public static matrix4MultiplyVector4(
    v: Vector4,
    m: Matrix4,
    out: Vector4,
  ): void {
    const mat = m.entries;

    // Cache to prevent data corruption during in-place mutation
    const vx = v.x,
      vy = v.y,
      vz = v.z,
      vw = v.w;

    // Row-Major multiplication logic
    out.x = vx * mat[0] + vy * mat[1] + vz * mat[2] + vw * mat[3];
    out.y = vx * mat[4] + vy * mat[5] + vz * mat[6] + vw * mat[7];
    out.z = vx * mat[8] + vy * mat[9] + vz * mat[10] + vw * mat[11];
    out.w = vx * mat[12] + vy * mat[13] + vz * mat[14] + vw * mat[15];
  }

  /**
   * Multiplies two 4x4 matrices (A * B).
   * Fully unrolled into explicit variables. Avoiding nested 'for' loops entirely
   * skips branch prediction overhead and allows maximum compiler optimization.
   */
  public static multiplyMatrix4(a: Matrix4, b: Matrix4, out: Matrix4): void {
    const aMat = a.entries;
    const bMat = b.entries;
    const outMat = out.entries;

    //#region Matrix A Caching
    const a00 = aMat[0],
      a01 = aMat[1],
      a02 = aMat[2],
      a03 = aMat[3];
    const a10 = aMat[4],
      a11 = aMat[5],
      a12 = aMat[6],
      a13 = aMat[7];
    const a20 = aMat[8],
      a21 = aMat[9],
      a22 = aMat[10],
      a23 = aMat[11];
    const a30 = aMat[12],
      a31 = aMat[13],
      a32 = aMat[14],
      a33 = aMat[15];
    //#endregion

    //#region Matrix B Caching
    const b00 = bMat[0],
      b01 = bMat[1],
      b02 = bMat[2],
      b03 = bMat[3];
    const b10 = bMat[4],
      b11 = bMat[5],
      b12 = bMat[6],
      b13 = bMat[7];
    const b20 = bMat[8],
      b21 = bMat[9],
      b22 = bMat[10],
      b23 = bMat[11];
    const b30 = bMat[12],
      b31 = bMat[13],
      b32 = bMat[14],
      b33 = bMat[15];
    //#endregion

    //#region Multiply A x B
    outMat[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    outMat[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    outMat[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    outMat[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    outMat[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    outMat[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    outMat[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    outMat[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    outMat[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    outMat[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    outMat[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    outMat[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    outMat[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    outMat[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    outMat[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    outMat[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
    //#endregion
  }

  // --- TRANSFORMATION GENERATORS ---
  // The following methods overwrite the target matrix in-place.

  public static makeXRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = out.entries;
    m.fill(0);
    m[0] = 1;
    m[5] = c;
    m[6] = -s;
    m[9] = s;
    m[10] = c;
    m[15] = 1;
  }

  public static makeYRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = out.entries;
    m.fill(0);
    m[0] = c;
    m[2] = s;
    m[5] = 1;
    m[8] = -s;
    m[10] = c;
    m[15] = 1;
  }

  public static makeZRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = out.entries;
    m.fill(0);
    m[0] = c;
    m[1] = -s;
    m[4] = s;
    m[5] = c;
    m[10] = 1;
    m[15] = 1;
  }

  /**
   * Generates a combined Euler rotation matrix.
   * Multiplies locally in the specific order: Z -> Y -> X to avoid Gimbal Lock.
   */
  public static makeXYZRotationMatrix4(
    v: Vector3,
    mX: Matrix4,
    mY: Matrix4,
    mZ: Matrix4,
    out: Matrix4,
  ) {
    this.makeXRotationMatrix4(v.x, mX);
    this.makeYRotationMatrix4(v.y, mY);
    this.makeZRotationMatrix4(v.z, mZ);
    this.multiplyMatrix4(mX, mY, out); // out = X * Y
    this.multiplyMatrix4(out, mZ, out); // out = (X * Y) * Z
  }

  public static makeTranslationMatrix4(v: Vector3, out: Matrix4) {
    const m = out.entries;
    m.fill(0);
    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;
    m[3] = v.x;
    m[7] = v.y;
    m[11] = v.z; // Row-major translation column
  }

  public static makeScaleMatrix4(v: Vector3, out: Matrix4) {
    const m = out.entries;
    m.fill(0);
    m[0] = v.x;
    m[5] = v.y;
    m[10] = v.z;
    m[15] = 1;
  }

  /**
   * Generates the View Matrix (LookAt) for a Left-Handed Coordinate System.
   * Creates an orthogonal basis (X, Y, Z axes) from a viewpoint and target,
   * then applies the inverted translation to shift the world into camera space.
   */
  public static makeLookAtMatrix4(eye: Vector3, at: Vector3, out: Matrix4) {
    // 1. Z-Axis (Forward): Points FROM eye TO target (Left-Handed System)
    Vector3.subtract(at, eye, Matrix4.Z);
    Matrix4.Z.normalize();

    // 2. X-Axis (Right): Perpendicular to Global Up and Local Forward
    Vector3.crossProduct(Vector3.up, Matrix4.Z, Matrix4.X);
    Matrix4.X.normalize();

    // 3. Y-Axis (True Up): Perpendicular to Forward and Right
    Vector3.crossProduct(Matrix4.Z, Matrix4.X, Matrix4.Y);
    Matrix4.Y.normalize();

    // 4. Inverse Translation: Projecting the negative eye position onto the new axes
    const t_x = -Vector3.dotProduct(Matrix4.X, eye);
    const t_y = -Vector3.dotProduct(Matrix4.Y, eye);
    const t_z = -Vector3.dotProduct(Matrix4.Z, eye);

    // 5. Build Row-Major Matrix:
    // Axes form the upper 3x3 rotation subset.
    // Translation dictates the right-most 4th column (indices 3, 7, 11).
    out.entries.set([
      this.X.x,
      this.X.y,
      this.X.z,
      t_x,
      this.Y.x,
      this.Y.y,
      this.Y.z,
      t_y,
      this.Z.x,
      this.Z.y,
      this.Z.z,
      t_z,
      0,
      0,
      0,
      1,
    ]);
  }
}
