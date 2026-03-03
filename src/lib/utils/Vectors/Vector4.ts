import Vector2 from "./Vector2.js";
import Vector3 from "./Vector3.js";

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

  public static sum(
    v1: Vector4,
    v2: Vector4 | Vector3 | Vector2,
    out: Vector4,
  ) {
    if (v2 instanceof Vector4) {
      out.x = v1.x + v2.x;
      out.y = v1.y + v2.y;
      out.z = v1.z + v2.z;
      out.w = v1.w + v2.w;
    } else if (v2 instanceof Vector3) {
      out.x = v1.x + v2.x;
      out.y = v1.y + v2.y;
      out.z = v1.z + v2.z;
      out.w = 0;
    } else if (v2 instanceof Vector2) {
      out.x = v1.x + v2.x;
      out.y = v1.y + v2.y;
      out.z = 0;
      out.w = 0;
    }
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
