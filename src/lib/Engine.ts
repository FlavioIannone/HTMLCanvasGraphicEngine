import config from "../game.config.js";
import Screen from "./utils/CoordinatesManagers/Screen.js";

export default class Engine {
  private static _canvas: HTMLCanvasElement | null;
  private static _context: CanvasRenderingContext2D | null;

  public static get context() {
    if (!this._context) throw Error("Canvas context not found");
    return this._context;
  }
  public static get canvas() {
    if (!this._canvas) throw Error("Canvas element not found");
    return this._canvas;
  }
  public static get instance() {
    if (!this._instance) throw Error("Engine not initialized");
    return this._instance;
  }

  private static _instance: Engine | null = null;

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

  public static instantiate() {
    Engine._instance = new Engine();
    console.log(Engine._instance);
  }

  public static onWindowResize(e: UIEvent) {
    Engine.setCanvas();
  }

  public static setCanvas() {
    config.screenConfig.width = window.innerWidth * window.devicePixelRatio;
    config.screenConfig.height = window.innerHeight * window.devicePixelRatio;
    Engine.canvas.width = config.screenConfig.width;
    Engine.canvas.height = config.screenConfig.height;

    Screen.updateProjectionMatrix();
  }
}
