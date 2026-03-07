import config from "../game.config.js";
import Screen from "./utils/CoordinatesManagers/Screen.js";
import { InputManager } from "./utils/InputManager/InputManager.js";
import Time from "./utils/Time.js";

/**
 * Core Engine class responsible for managing the rendering context,
 * canvas lifecycle, and main update loop variables.
 * Implements a strict Singleton pattern to act as the central nervous system
 * of the application.
 */
export default class Engine {
  // References to the HTML canvas and its 2D rendering context.
  private static _canvas: HTMLCanvasElement | null = null;
  private static _context: CanvasRenderingContext2D | null = null;

  // --- OPTIMIZATION: DEFERRED RESIZE (DIRTY FLAG) ---
  // Window resize events can fire dozens of times per second. Recalculating
  // projection matrices and DOM layouts synchronously causes severe frame drops.
  // This flag defers the heavy computation to the next safe Update cycle.
  private static _needsResize: boolean = true;

  // The single authorized instance of the Engine.
  private static _instance: Engine | null = null;

  /**
   * Gets the 2D rendering context.
   * @throws {Error} If accessed before Engine initialization.
   */
  public static get context(): CanvasRenderingContext2D {
    if (!Engine._context) throw Error("Canvas context not found");
    return Engine._context;
  }

  /**
   * Gets the HTML canvas element.
   * @throws {Error} If accessed before Engine initialization.
   */
  public static get canvas(): HTMLCanvasElement {
    if (!Engine._canvas) throw Error("Canvas element not found");
    return Engine._canvas;
  }

  /**
   * Gets the Singleton instance of the Engine.
   * @throws {Error} If the engine hasn't been instantiated yet.
   */
  public static get instance(): Engine {
    if (!Engine._instance) throw Error("Engine not initialized");
    return Engine._instance;
  }

  /**
   * Private constructor to enforce the Singleton pattern.
   * Binds the canvas element from the DOM and extracts its 2D context.
   */
  private constructor() {
    if (!Engine._instance) {
      Engine._instance = this;
      Engine._canvas = document.getElementById(
        "canvas",
      ) as HTMLCanvasElement | null;

      if (!Engine._canvas) throw Error("Canvas element not found in DOM.");

      Engine._context = Engine._canvas.getContext("2d");

      if (!Engine._context) throw new Error("2D Canvas context not supported.");
    }
    return Engine._instance;
  }

  /**
   * Phase 1 of the Lifecycle: Instantiates the Engine Singleton.
   * Must be called before accessing any systems.
   */
  public static instantiate(): void {
    if (!Engine._instance) {
      new Engine();
    }
  }

  /**
   * Phase 2 of the Lifecycle: Awake.
   * Called once before the first frame is rendered to allocate memory
   * and initialize core foundational subsystems.
   */
  public static awake(): void {
    Engine.instantiate();
    Time.instantiate();
    Screen.instantiate();
    InputManager.instantiate();
    InputManager.init();
  }

  /**
   * Phase 3 of the Lifecycle: Start.
   * Called exactly once before the update loop begins.
   * Safe to bind DOM events here as all core systems are guaranteed to be alive.
   */
  public static start(): void {
    // If any of these getters fail, they will intentionally throw an Error
    // and halt the execution, preventing undefined behavior down the line.
    const ensureTime = Time.instance;
    const ensureScreen = Screen.instance;

    window.addEventListener("resize", Engine.onWindowResize);

    // Note: Requesting pointer lock usually requires user interaction (e.g., click)
    // rather than just a 'focus' event to bypass browser security policies.
    window.addEventListener("focus", () => {
      if (Engine._canvas) InputManager.requestPointerLock();
    });
  }

  /**
   * Phase 4 of the Lifecycle: Update.
   * Called once per frame inside the main game loop (requestAnimationFrame).
   * Orchestrates the clearing of the screen, time delta calculation, and deferred resizing.
   * @param time The high-resolution timestamp provided by the browser.
   */
  public static update(time: number): void {
    // 1. Wipe the previous frame's artifacts
    Screen.clear();

    // 2. Calculate delta time for frame-rate independent physics/movement
    Time.update(time);

    // 3. Process deferred layout recalulations securely outside the event listener
    if (Engine._needsResize) {
      Engine.setCanvas();
      Engine._needsResize = false;
    }
  }

  /**
   * Event listener callback for the window 'resize' event.
   * strictly sets a flag to avoid jank/stuttering during active window drag.
   */
  public static onWindowResize = (e: UIEvent): void => {
    Engine._needsResize = true;
  };

  /**
   * Recomputes the canvas internal resolution to match the physical window size.
   * Applies devicePixelRatio to ensure crisp rendering on High-DPI (Retina) displays.
   */
  public static setCanvas(): void {
    // Calculate the high-resolution internal buffer size
    config.screenConfig.width = window.innerWidth * window.devicePixelRatio;
    config.screenConfig.heigth = window.innerHeight * window.devicePixelRatio;

    // Apply the resolution directly to the physical canvas grid
    Engine.canvas.width = config.screenConfig.width;
    Engine.canvas.height = config.screenConfig.heigth;

    // Force the projection matrix to rebuild with the new aspect ratio
    // This prevents the 3D world from stretching or squashing.
    Screen.updateProjectionMatrix();
  }
}
