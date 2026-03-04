export default class Vector2 {
  public x: number;
  public y: number;

  // A shared, strictly READ-ONLY instance representing (0,0).
  // Useful for comparisons or read-only default parameters without allocating memory.
  public static readonly zero: Readonly<Vector2> = new Vector2(0, 0);

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Calculates the mathematical length (magnitude) of the vector.
   * @returns The length of the vector.
   */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalizes the vector IN-PLACE.
   * Forces the vector's magnitude to be exactly 1 while preserving its direction.
   * Fixes the "faster diagonal movement" bug by using the Pythagorean theorem.
   */
  public normalize(): void {
    const mag = this.magnitude;
    if (mag > 0.00001) {
      this.x = this.x / mag;
      this.y = this.y / mag;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  /**
   * Translates this vector by adding another vector's components.
   * @param t The vector to add.
   */
  public translate(t: Readonly<Vector2>): void {
    this.x += t.x;
    this.y += t.y;
  }

  /**
   * Rotates this vector around the Z axis (2D rotation) by the given angle.
   * @param angle The angle in radians.
   */
  public rotateZ(angle: number): void {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tempX = this.x;

    this.x = tempX * c - this.y * s;
    this.y = tempX * s + this.y * c;
  }

  // --- STATIC METHODS (Zero-Allocation Pattern) ---

  /**
   * Sums two vectors and stores the result in an existing output vector.
   * Prevents Garbage Collection overhead in tight rendering loops.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @param out The vector to store the result in.
   */
  public static sum(
    v1: Readonly<Vector2>,
    v2: Readonly<Vector2>,
    out: Vector2,
  ): void {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
  }

  /**
   * Checks if two vectors are mathematically identical.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns True if x and y match exactly.
   */
  public static isEqual(v1: Readonly<Vector2>, v2: Readonly<Vector2>): boolean {
    return v1.x === v2.x && v1.y === v2.y;
  }
}
