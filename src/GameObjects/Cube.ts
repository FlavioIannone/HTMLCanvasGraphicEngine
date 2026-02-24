import CubeMesh from "../lib/Meshes/CubeMesh.js";
import Time from "../lib/utils/Time.js";
import Vector3 from "../lib/utils/Vector3.js";
import GameObject from "./GameObject.js";

export default class Cube extends GameObject {
  constructor(
    context: CanvasRenderingContext2D,
    position: Vector3,
    rotation: Vector3,
    size: Vector3,
  ) {
    super(context, new CubeMesh(size), position, rotation, size);
  }

  public update(): void {
    super.update();
    this.transform.rotation.y += (Math.PI / 4) * Time.deltaTime;
  }
}
