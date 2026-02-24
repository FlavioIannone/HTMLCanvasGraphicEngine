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

  translate(t: Vector3) {
    this.x += t.x;
    this.y += t.y;
    this.z += t.z;
  }

  rotateY(angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tempX = this.x;

    this.x = tempX * c - this.z * s;
    this.z = tempX * s + this.z * c;
  }

  rotateX(angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tempY = this.y;

    this.y = tempY * c - this.z * s;
    this.z = tempY * s + this.z * c;
  }

  rotateZ(angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tempX = this.x;

    this.x = tempX * c - this.y * s;
    this.y = tempX * s + this.y * c;
  }
}
