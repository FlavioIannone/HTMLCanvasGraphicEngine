import { ProjectedVertex, Triangle } from "../../utils/Types.js";
import Vector2 from "../../utils/Vectors/Vector2.js";
import Vector3 from "../../utils/Vectors/Vector3.js";
import Mesh from "../Mesh.js";

export default class CubeMesh implements Mesh {
  vertexes: Vector3[];
  cameraSpaceVertexes: Vector3[];
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

    this.cameraSpaceVertexes = [
      new Vector3(-this.size.x, this.size.y, this.size.z),
      new Vector3(this.size.x, this.size.y, this.size.z),
      new Vector3(this.size.x, -this.size.y, this.size.z),
      new Vector3(-this.size.x, -this.size.y, this.size.z),

      new Vector3(-this.size.x, this.size.y, -this.size.z),
      new Vector3(this.size.x, this.size.y, -this.size.z),
      new Vector3(this.size.x, -this.size.y, -this.size.z),
      new Vector3(-this.size.x, -this.size.y, -this.size.z),
    ];

    this.triangles = [
      { vertexes: [0, 1, 2], color: [255, 0, 0] },
      { vertexes: [0, 2, 3], color: [255, 0, 0] },

      { vertexes: [5, 4, 7], color: [0, 255, 0] },
      { vertexes: [5, 7, 6], color: [0, 255, 0] },

      { vertexes: [4, 5, 1], color: [0, 0, 255] },
      { vertexes: [4, 1, 0], color: [0, 0, 255] },

      { vertexes: [3, 2, 6], color: [255, 255, 0] },
      { vertexes: [3, 6, 7], color: [255, 255, 0] },

      { vertexes: [1, 5, 6], color: [0, 255, 255] },
      { vertexes: [1, 6, 2], color: [0, 255, 255] },

      { vertexes: [4, 0, 3], color: [255, 0, 255] },
      { vertexes: [4, 3, 7], color: [255, 0, 255] },
    ];
  }
}
