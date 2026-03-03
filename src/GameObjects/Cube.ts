import CubeMesh from "../lib/Meshes/Cube/CubeMesh.js";
import Vector3 from "../lib/utils/Vectors/Vector3.js";
import GameObject from "./GameObject.js";

export default class Cube extends GameObject {
  constructor(position: Vector3, rotation: Vector3, size: Vector3) {
    super(new CubeMesh(size), position, rotation, size);
  }

  public update(): void {
    super.update();
  }
}
