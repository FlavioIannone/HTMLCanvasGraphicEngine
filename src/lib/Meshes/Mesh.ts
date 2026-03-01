import { ProjectedVertex, Triangle } from "../utils/Types.js";
import Vector3 from "../utils/Vectors/Vector3.js";

export default interface Mesh {
  vertexes: Vector3[];
  projectedVertexes: ProjectedVertex[]; // This array will be holding the projected vertexes, along with their depth (for the painter's algorithm to work).
  triangles: Triangle[];
}
