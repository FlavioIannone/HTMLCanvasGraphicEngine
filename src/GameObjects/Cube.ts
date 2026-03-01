import CubeMesh from "../lib/Meshes/Cube/CubeMesh.js";
import Time from "../lib/utils/Time.js";
import Vector3 from "../lib/utils/Vectors/Vector3.js";
import GameObject from "./GameObject.js";

export default class Cube extends GameObject {
  constructor(position: Vector3, rotation: Vector3, size: Vector3) {
    super(new CubeMesh(size), position, rotation, size);
  }

  public update(): void {
    super.update();
    this.transform.rotation.y += (Math.PI / 4) * Time.deltaTime;
    this.transform.position.z += Time.deltaTime / 5;
  }
}
