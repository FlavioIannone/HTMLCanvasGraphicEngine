export default class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  public static get zero() {
    return new Vector4();
  }

  public static sum(v1: Vector4, v2: Vector4): Vector4 {
    return new Vector4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
  }

  public add(v: Vector4) {
    this.x + v.x;
    this.y + v.y;
    this.z + v.z;
    this.w + v.w;
  }

  translate(t: Vector4) {
    this.x += t.x;
    this.y += t.y;
    this.z += t.z;
    this.w += t.w;
  }
}
