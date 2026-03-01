import Vector4 from "../Vectors/Vector4.js";

export class Matrix4 {
  public matrix: Float32Array;
  private static temp_m: Float32Array = new Float32Array();

  constructor() {
    this.matrix = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);
  }

  public static matrix4MultiplyVector4(
    v: Vector4,
    m: Matrix4,
    out: Vector4,
  ): void {
    const mat = m.matrix;

    const vx = v.x;
    const vy = v.y;
    const vz = v.z;
    const vw = v.w;

    out.x = vx * mat[0] + vy * mat[1] + vz * mat[2] + vw * mat[3];
    out.y = vx * mat[4] + vy * mat[5] + vz * mat[6] + vw * mat[7];
    out.z = vx * mat[8] + vy * mat[9] + vz * mat[10] + vw * mat[11];
    out.w = vx * mat[12] + vy * mat[13] + vz * mat[14] + vw * mat[15];
  }
}
