export default class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  // --- CONSTANTS ---
  // Shared, STRICTLY READ-ONLY instances to prevent memory allocation in tight loops.
  public static readonly zero: Readonly<Vector3> = new Vector3(0, 0, 0);
  public static readonly up: Readonly<Vector3> = new Vector3(0, 1, 0);
  public static readonly forward: Readonly<Vector3> = new Vector3(0, 0, 1);

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Calculates the mathematical length (magnitude) of the 3D vector.
   * @returns The scalar length.
   */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Normalizes the vector IN-PLACE.
   * Forces the vector's magnitude to be exactly 1 while preserving its direction.
   */
  public normalize(): void {
    const mag = this.magnitude;
    if (mag > 0.00001) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
    } else {
      // Prevents NaN corruption if the vector length is 0
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
  }

  // --- ZERO-ALLOCATION STATIC METHODS ---

  /**
   * Adds two vectors and stores the result in the provided output vector.
   */
  public static sum(
    v1: Readonly<Vector3>,
    v2: Readonly<Vector3>,
    out: Vector3,
  ): void {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
    out.z = v1.z + v2.z;
  }

  /**
   * Subtracts the second vector from the first (v1 - v2) and stores the result.
   * Crucial for finding the direction vector between two points.
   */
  public static subtract(
    v1: Readonly<Vector3>,
    v2: Readonly<Vector3>,
    out: Vector3,
  ): void {
    out.x = v1.x - v2.x;
    out.y = v1.y - v2.y;
    out.z = v1.z - v2.z;
  }

  /**
   * Computes the Cross Product of two vectors.
   * Returns a new vector that is perpendicular (orthogonal) to both input vectors.
   * This is the mathematical foundation for generating the Camera's View Matrix (LookAt).
   */
  public static crossProduct(
    a: Readonly<Vector3>,
    b: Readonly<Vector3>,
    out: Vector3,
  ): void {
    // Cache inputs to allow 'out' to be the same as 'a' or 'b' without aliasing bugs
    const ax = a.x,
      ay = a.y,
      az = a.z;
    const bx = b.x,
      by = b.y,
      bz = b.z;

    out.x = ay * bz - az * by;
    out.y = az * bx - ax * bz;
    out.z = ax * by - ay * bx;
  }

  /**
   * Checks if two vectors are mathematically identical.
   */
  public static isEqual(v1: Readonly<Vector3>, v2: Readonly<Vector3>): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
}
