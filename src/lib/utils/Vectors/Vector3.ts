export default class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static get zero() {
    return new Vector3(0, 0, 0);
  }

  public static sum(v1: Vector3, v2: Vector3): Vector3 {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  static isEqual(v1: Vector3, v2: Vector3): boolean {
    const x1 = v1.x;
    const y1 = v1.y;
    const z1 = v1.z;

    const x2 = v2.x;
    const y2 = v2.y;
    const z2 = v2.z;

    return x1 === x2 && y1 == y2 && z1 == z2;
  }
}
