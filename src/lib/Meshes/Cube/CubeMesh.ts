import { ProjectedVertex, Triangle } from "../../utils/Types.js";
import Vector2 from "../../utils/Vectors/Vector2.js";
import Vector3 from "../../utils/Vectors/Vector3.js";
import Mesh from "../Mesh.js";

export default class CubeMesh implements Mesh {
  vertexes: Vector3[];
  projectedVertexes: ProjectedVertex[];
  triangles: Triangle[];
  size: Vector3;

  constructor(size: Vector3) {
    this.size = size;

    this.vertexes = [
      new Vector3(-this.size.x, this.size.y, this.size.z),
      new Vector3(this.size.x, this.size.y, this.size.z),
      new Vector3(this.size.x, -this.size.y, this.size.z),
      new Vector3(-this.size.x, -this.size.y, this.size.z),

      new Vector3(-this.size.x, this.size.y, -this.size.z),
      new Vector3(this.size.x, this.size.y, -this.size.z),
      new Vector3(this.size.x, -this.size.y, -this.size.z),
      new Vector3(-this.size.x, -this.size.y, -this.size.z),
    ];

    this.projectedVertexes = []; // Instantiate the projected vertexes once, then, on every render iteration the state of the vertex will be mutated, for performance implications.
    for (let i = 0; i < 8; i++) {
      this.projectedVertexes.push({
        position: new Vector2(),
        depth: 0,
      });
    }

    this.triangles = [
      [0, 1, 2],
      [0, 2, 3],

      [5, 4, 7],
      [5, 7, 6],

      [4, 5, 1],
      [4, 1, 0],

      [3, 2, 6],
      [3, 6, 7],

      [1, 5, 6],
      [1, 6, 2],

      [4, 0, 3],
      [4, 3, 7],
    ];
  }
}
