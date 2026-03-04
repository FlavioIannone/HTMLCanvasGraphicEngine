export default class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  // Shared, STRICTLY READ-ONLY instance to prevent memory allocation in tight loops.
  public static readonly zero: Readonly<Vector4> = new Vector4(0, 0, 0, 0);

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Adds another Vector4 to this instance IN-PLACE.
   * Mutates the current vector directly to avoid memory allocation.
   * @param v The vector to add.
   */
  public add(v: Readonly<Vector4>): void {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
  }

  // --- ZERO-ALLOCATION STATIC METHODS ---

  /**
   * Sums two Vector4 instances and stores the result in an existing output vector.
   * PERFORMANCE CRITICAL: Strictly accepts only Vector4 to maintain JIT monomorphism.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @param out The vector to store the result in.
   */
  public static sum(
    v1: Readonly<Vector4>,
    v2: Readonly<Vector4>,
    out: Vector4,
  ): void {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
    out.z = v1.z + v2.z;
    out.w = v1.w + v2.w;
  }

  /**
   * Checks if two Vector4 instances are mathematically identical.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns True if all components (x, y, z, w) match exactly.
   */
  public static isEqual(v1: Readonly<Vector4>, v2: Readonly<Vector4>): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z && v1.w === v2.w;
  }
}
