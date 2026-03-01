import { Triangle } from "../utils/Types.js";
import Vector3 from "../utils/Vectors/Vector3.js";

export default interface Mesh {
  vertexes: Vector3[];
  triangles: Triangle[];
}
