/**
 * A collection of high-performance mathematical utility functions
 * used throughout the graphics engine.
 */
export default class MathUtils {
  /**
   * Re-maps a number from one range to another.
   * WARNING: This function does NOT constrain the value to the output range (Extrapolation).
   * If 'value' is outside [inMin, inMax], the result will be outside [outMin, outMax].
   * Use clamp() on the result if strict boundaries are required.
   *
   * @param value The number to map.
   * @param inMin The lower bound of the value's current range.
   * @param inMax The upper bound of the value's current range.
   * @param outMin The lower bound of the value's target range.
   * @param outMax The upper bound of the value's target range.
   * @returns The mathematically mapped value.
   */
  public static map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    // Avoid division by zero if the input range is practically zero
    if (inMax - inMin === 0) {
      console.warn("MathUtils.map: Input range is zero. Returning outMin.");
      return outMin;
    }

    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  /**
   * Constrains a value to be within a specific range.
   * Extremely cheap operation used to prevent values from overflowing bounds.
   *
   * @param value The number to constrain.
   * @param min The minimum acceptable value.
   * @param max The maximum acceptable value.
   * @returns The clamped value.
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Helper function combining map and clamp for safety.
   * Guarantees the output will never exceed outMin and outMax.
   */
  public static mapClamped(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    const mapped = this.map(value, inMin, inMax, outMin, outMax);
    return this.clamp(
      mapped,
      Math.min(outMin, outMax),
      Math.max(outMin, outMax),
    );
  }
}
