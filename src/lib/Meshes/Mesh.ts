import { ProjectedVertex, Triangle } from "../utils/Types.js";
import Vector3 from "../utils/Vectors/Vector3.js";

export default interface Mesh {
  vertexes: Vector3[];
  cameraSpaceVertexes: Vector3[]; // This array will be holding the vertexes translated, rotated and scaled in world space.
  triangles: Triangle[];
}
