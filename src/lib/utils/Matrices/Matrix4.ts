import Vector3 from "../Vectors/Vector3.js";
import Vector4 from "../Vectors/Vector4.js";

/**
 * Represents a 4x4 Matrix using a flat Float32Array for maximum performance.
 * Employs row-major ordering and strictly uses pre-allocated memory to avoid Garbage Collection.
 */
export class Matrix4 {
  public entries: Float32Array;

  constructor() {
    // Initializes as an Identity Matrix
    this.entries = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
  }

  /**
   * Returns a new matrix initialized as an Identity Matrix
   */
  public static get identity() {
    return new Matrix4();
  }

  /**
   * Resets the given matrix back to an Identity Matrix.
   * @param out The matrix to reset.
   */
  public static resetToIdentity(out: Matrix4) {
    out.entries.fill(0);
    out.entries[0] = 1;
    out.entries[5] = 1;
    out.entries[10] = 1;
    out.entries[15] = 1;
  }

  /**
   * Multiplies a 4D vector by a 4x4 matrix (M * v).
   * @param v The input vector.
   * @param m The transformation matrix.
   * @param out The vector where the result will be stored (can be the same as 'v').
   */
  public static matrix4MultiplyVector4(
    v: Vector4,
    m: Matrix4,
    out: Vector4,
  ): void {
    const mat = m.entries;

    // Cache vector values to prevent aliasing if 'v' and 'out' are the same object
    const vx = v.x;
    const vy = v.y;
    const vz = v.z;
    const vw = v.w;

    out.x = vx * mat[0] + vy * mat[1] + vz * mat[2] + vw * mat[3];
    out.y = vx * mat[4] + vy * mat[5] + vz * mat[6] + vw * mat[7];
    out.z = vx * mat[8] + vy * mat[9] + vz * mat[10] + vw * mat[11];
    out.w = vx * mat[12] + vy * mat[13] + vz * mat[14] + vw * mat[15];
  }

  /**
   * Multiplies two 4x4 matrices (A * B).
   * Fully unrolled for CPU performance. Uses local caching to safely allow 'out'
   * to be the same instance as 'a' or 'b' without memory corruption (aliasing).
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
    // First row
    outMat[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    outMat[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    outMat[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    outMat[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    // Second row
    outMat[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    outMat[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    outMat[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    outMat[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    // Third row
    outMat[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    outMat[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    outMat[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    outMat[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    // Fourth row
    outMat[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    outMat[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    outMat[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    outMat[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
    //#endregion
  }

  /**
   * Generates a rotation matrix around the X axis (Pitch).
   * Overwrites all 16 indices.
   */
  public static makeXRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const m = out.entries;
    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 0;
    m[5] = c;
    m[6] = -s;
    m[7] = 0;
    m[8] = 0;
    m[9] = s;
    m[10] = c;
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }

  /**
   * Generates a rotation matrix around the Y axis (Yaw).
   * Overwrites all 16 indices.
   */
  public static makeYRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const m = out.entries;
    m[0] = c;
    m[1] = 0;
    m[2] = s;
    m[3] = 0;
    // CRITICAL FIX: m[5] must be 1 to preserve the Y axis scale during rotation.
    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = 0;
    m[8] = -s;
    m[9] = 0;
    m[10] = c;
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }

  /**
   * Generates a rotation matrix around the Z axis (Roll).
   * Overwrites all 16 indices.
   */
  public static makeZRotationMatrix4(angle: number, out: Matrix4) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const m = out.entries;
    m[0] = c;
    m[1] = -s;
    m[2] = 0;
    m[3] = 0;
    m[4] = s;
    m[5] = c;
    m[6] = 0;
    m[7] = 0;
    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }

  /**
   * Combines individual Euler angle rotations into a single rotation matrix.
   * Multiplication order is M = Mx * My * Mz.
   * When applied to a vector (M * v), the rotation application order is Z, then Y, then X.
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

  /**
   * Generates a translation matrix.
   * Overwrites all 16 indices.
   */
  public static makeTranslationMatrix4(v: Vector3, out: Matrix4) {
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const m = out.entries;

    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = x;
    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = y;
    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = z;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }

  /**
   * Generates a scaling matrix.
   * Overwrites all 16 indices.
   */
  public static makeScaleMatrix4(v: Vector3, out: Matrix4) {
    const x = v.x;
    const y = v.y;
    const z = v.z;
    const m = out.entries;

    m[0] = x;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;
    m[4] = 0;
    m[5] = y;
    m[6] = 0;
    m[7] = 0;
    m[8] = 0;
    m[9] = 0;
    m[10] = z;
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }
}
