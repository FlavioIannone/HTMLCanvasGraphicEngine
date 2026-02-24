/**
 * Singleton class responsible for managing the game loop timing.
 * It calculates the time difference between frames (deltaTime) and the total elapsed time.
 */
export default class Time {
  /** The timestamp of the previous frame (in milliseconds). used to calculate delta. */
  private lastTime: number = 0;

  /** * The maximum allowed delta time in seconds.
   * Prevents "spiral of death" or massive physics jumps when the tab is inactive or during lag spikes.
   */
  private readonly maxDelta: number;

  /** The singleton instance reference. */
  public static instance: Time | null = null;

  /** The time in seconds it took to complete the last frame. */
  private static _deltaTime = 0;

  /** The total time in seconds since the game started. */
  private static _time = 0;

  /**
   * Private constructor to enforce Singleton pattern.
   * @param maxDelta - Cap for the delta time (default 0.1s / 100ms).
   */
  private constructor(maxDelta: number = 0.1) {
    this.maxDelta = maxDelta;
    if (!Time.instance) {
      Time.instance = this;
    }
    return Time.instance;
  }

  /**
   * Gets the interval in seconds from the last frame to the current one.
   * @throws Error if Time is not instantiated.
   */
  public static get deltaTime(): number {
    if (!Time.instance)
      throw new Error(
        "Time class not instantiated. Call Time.instantiate() first.",
      );
    return Time._deltaTime;
  }

  /**
   * Gets the total time in seconds since the start of the application.
   */
  public static get time(): number {
    if (!Time.instance) throw new Error("Time class not instantiated.");
    return Time._time;
  }

  // --- Lifecycle Methods ---

  /**
   * Initializes the Time singleton. Must be called before the game loop starts.
   * @param maxDelta - Optional cap for delta time (default 0.1).
   */
  public static instantiate(maxDelta: number = 0.1): void {
    Time.instance = new Time(maxDelta);
  }

  /**
   * Internal method to compute the time difference.
   * @param currentTime - The timestamp provided by requestAnimationFrame.
   */
  private static calculateDeltaTime(currentTime: number): void {
    if (!Time.instance) throw new Error("Time not instantiated.");

    // Handle the very first frame
    if (Time.instance.lastTime === 0) {
      Time.instance.lastTime = currentTime;
      // Delta is 0 on the first frame to prevent jumps
      Time._deltaTime = 0;
      return;
    }

    // Convert milliseconds to seconds
    let dt = (currentTime - Time.instance.lastTime) / 1000;

    // Clamp the delta time to avoid physics explosions during lag
    if (dt > Time.instance.maxDelta) {
      dt = Time.instance.maxDelta;
    }

    Time.instance.lastTime = currentTime;
    Time._deltaTime = dt;
  }

  /**
   * Must be called at the start of every frame in the game loop.
   * @param currentTime - The high-precision timestamp.
   */
  public static update(currentTime: number): void {
    Time.calculateDeltaTime(currentTime);
    // Accumulate total time
    Time._time += Time._deltaTime;
  }
}
