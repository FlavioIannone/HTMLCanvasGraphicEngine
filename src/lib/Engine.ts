import config from "../game.config.js";
import Screen from "./utils/CoordinatesManagers/Screen.js";
import Time from "./utils/Time.js";

/**
 * Core Engine class responsible for managing the rendering context,
 * canvas lifecycle, and main update loop variables.
 * Implements a Singleton pattern to ensure only one engine instance exists.
 */
export default class Engine {
  // References to the HTML canvas and its 2D rendering context
  private static _canvas: HTMLCanvasElement | null;
  private static _context: CanvasRenderingContext2D | null;

  // Dirty flag pattern: ensures expensive resize operations (matrix math and buffer reallocation)
  // are performed at most once per frame, regardless of how many resize events fire.
  private static _needsResize: boolean = true;
  // The single instance of the Engine
  private static _instance: Engine | null = null;

  /**
   * Gets the 2D rendering context.
   * @throws Error if the context hasn't been initialized.
   */
  public static get context() {
    if (!Engine._context) throw Error("Canvas context not found");
    return Engine._context;
  }

  /**
   * Gets the HTML canvas element.
   * @throws Error if the canvas hasn't been initialized.
   */
  public static get canvas() {
    if (!Engine._canvas) throw Error("Canvas element not found");
    return Engine._canvas;
  }

  /**
   * Gets the Singleton instance of the Engine.
   * @throws Error if the engine hasn't been instantiated yet.
   */
  public static get instance() {
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

      if (!Engine._canvas) throw Error("Canvas element not found");

      Engine._context = Engine._canvas.getContext("2d");

      if (!Engine._context) throw new Error("Canvas context not found");
    }
    return Engine._instance;
  }

  /**
   * Initializes the Engine Singleton.
   * Must be called before accessing the instance or context.
   */
  public static instantiate() {
    Engine._instance = new Engine();
  }

  /**
   * Called once before the first frame is rendered
   */
  public static awake() {
    Engine.instantiate();
    Time.instantiate();
    Screen.instantiate();
  }

  /**
   * Called only in the first frame
   */
  public static start() {
    if (!Engine.instance) {
      console.error("Error, Time not instantiated.");
      return;
    }
    if (!Screen.instance) {
      console.error("Error, Time not instantiated.");
      return;
    }
    if (!Time.instance) {
      console.error("Error, Time not instantiated.");
      return;
    }
  }

  /**
   * Called once per frame inside the main game loop.
   * Calls the update methods of the utils singletons.
   * Checks for the dirty flag and processes delayed resizes.
   */
  public static update(time: number) {
    Screen.clear();
    Time.update(time);
    if (Engine._needsResize) {
      Engine.setCanvas();
      Engine._needsResize = false;
    }
  }

  /**
   * Event listener callback for the window 'resize' event.
   * It only raises the dirty flag, deferring the heavy computations to the update loop.
   * @param e The UI Event passed by the event listener.
   */
  public static onWindowResize(e: UIEvent) {
    Engine._needsResize = true;
  }

  /**
   * Recomputes the canvas dimensions to match the window, applying devicePixelRatio
   * for high-DPI (Retina) displays, and updates the projection matrix.
   */
  public static setCanvas() {
    // Calculate the high-resolution internal buffer size based on pixel ratio
    config.screenConfig.width = window.innerWidth * window.devicePixelRatio;
    config.screenConfig.height = window.innerHeight * window.devicePixelRatio;

    // Set the internal resolution of the canvas (the actual pixel grid)
    Engine.canvas.width = config.screenConfig.width;
    Engine.canvas.height = config.screenConfig.height;

    // Update the mathematical projection matrix with the new aspect ratio
    Screen.updateProjectionMatrix();
  }
}
