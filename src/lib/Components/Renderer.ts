import config from "../../game.config.js";
import GameObject from "../../GameObjects/GameObject.js";
import Engine from "../Engine.js";
import Mesh from "../Meshes/Mesh.js";
import Screen from "../utils/CoordinatesManagers/Screen.js";
import { ProjectedVertex } from "../utils/Types.js";
import Vector2 from "../utils/Vectors/Vector2.js";
import Vector3 from "../utils/Vectors/Vector3.js";

// Renderable triangle with an average depth
type RenderableTriangle = {
  p1: Vector2;
  p2: Vector2;
  p3: Vector2;
  avgDepth: number;
};

export default class Renderer {
  private gameObject: GameObject;
  public mesh: Mesh;
  // Vector used for the projection pipeline, allocating it here and mutating it's state on every render, avoiding memory leak.
  private workVec: Vector3 = Vector3.zero;

  constructor(gameObject: GameObject, mesh: Mesh) {
    this.gameObject = gameObject;
    this.mesh = mesh;
  }

  update() {
    const projectedVertexes = this.getLocalVertexes();
    const trianglesToDraw: RenderableTriangle[] =
      this.getTriangles(projectedVertexes);
    this.render(trianglesToDraw);
  }

  /**
   * Projects the vertexes of the mesh into the screen
   * @returns an array of projected vertexes with their depth available
   */
  private getLocalVertexes(): ProjectedVertex[] {
    const t = this.gameObject.transform; // Short references to the transform

    for (let i = 0; i < this.mesh.vertexes.length; i++) {
      const localVertex = this.mesh.vertexes[i];
      // Internal temp variable for the position, so all of it's will be modified at once, mutated for each vertex.
      this.workVec = new Vector3(
        localVertex.x * t.size.x,
        localVertex.y * t.size.y,
        localVertex.z * t.size.z,
      );

      // ROTATE
      this.workVec.rotateZ(t.rotation.z);
      this.workVec.rotateX(t.rotation.x);
      this.workVec.rotateY(t.rotation.y);

      // TRANSLATE
      this.workVec = Vector3.sum(this.workVec, t.position);

      // PROJECT TO SCREEN
      Screen.project(this.workVec, this.mesh.projectedVertexes[i].position);
      Screen.toScreen(this.mesh.projectedVertexes[i].position);
      this.mesh.projectedVertexes[i].depth = this.workVec.z;

      // this.point(screenPos);
    }
    return this.mesh.projectedVertexes;
  }
  /**
   * Takes the vertices projected into the screen and creates an array of triangles that will constitute the mesh,
   * for each triangle an average depth is provided to identify which are on top.
   * @param projectedVertexes The projected vertexes
   * @returns An array of triangles sorted by their depth and ready to be rendered
   */
  private getTriangles(
    projectedVertexes: ProjectedVertex[],
  ): RenderableTriangle[] {
    const trianglesToDraw: RenderableTriangle[] = [];

    for (const tri of this.mesh.triangles) {
      // Get the three vertexes
      const v1 = projectedVertexes[tri[0]];
      const v2 = projectedVertexes[tri[1]];
      const v3 = projectedVertexes[tri[2]];

      // Calculate the average depth
      const zDepth = (v1.depth + v2.depth + v3.depth) / 3;

      // Insert the triangle into the array
      trianglesToDraw.push({
        p1: v1.position,
        p2: v2.position,
        p3: v3.position,
        avgDepth: zDepth,
      });
    }
    // Sort the array, the ones that are placed farder from the screen should be rendered first
    trianglesToDraw.sort((a, b) => b.avgDepth - a.avgDepth);
    return trianglesToDraw;
  }

  /**
   * Renders the triangles in the screen.
   * @param trianglesToDraw The triangles to render
   */
  private render(trianglesToDraw: RenderableTriangle[]) {
    for (const tri of trianglesToDraw) {
      Engine.context.beginPath(); // Prepare the context to render
      Engine.context.moveTo(tri.p1.x, tri.p1.y); // Starting point
      Engine.context.lineTo(tri.p2.x, tri.p2.y); // Move to the second point
      Engine.context.lineTo(tri.p3.x, tri.p3.y); // Move to the third point
      Engine.context.closePath(); // Close the path

      Engine.context.fillStyle = config.foregroundColor; // Set the color
      Engine.context.fill(); // Finally draw the path
    }
  }

  /**
   * Draws a line from p1 to p2.
   * @param p1 First point
   * @param p2 Second point
   */
  private line(p1: Vector2, p2: Vector2) {
    Engine.context.strokeStyle = config.foregroundColor;
    Engine.context.lineWidth = 2;
    Engine.context.beginPath();
    Engine.context.moveTo(p1.x, p1.y);
    Engine.context.lineTo(p2.x, p2.y);
    Engine.context.stroke();
  }

  /**
   * Draws a point
   * @param p position in which the point should be drawn
   */
  private point = (p: Vector2) => {
    Engine.context.fillStyle = config.foregroundColor;
    Engine.context.fillRect(
      p.x - config.pointWidth / 2,
      p.y - config.pointWidth / 2,
      config.pointWidth,
      config.pointWidth,
    );
  };
}
