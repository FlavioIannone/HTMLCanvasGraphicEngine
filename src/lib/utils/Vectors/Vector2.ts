export default class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public static get zero() {
    return new Vector2();
  }

  public static sum(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  translate(t: Vector2) {
    this.x += t.x;
    this.y += t.y;
  }

  rotateZ(angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tempX = this.x;

    this.x = tempX * c - this.y * s;
    this.y = tempX * s + this.y * c;
  }
}
