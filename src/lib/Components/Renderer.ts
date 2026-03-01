import config from "../../game.config.js";
import GameObject from "../../GameObjects/GameObject.js";
import Engine from "../Engine.js";
import Mesh from "../Meshes/Mesh.js";
import Screen from "../utils/CoordinatesManagers/Screen.js";
import Vector2 from "../utils/Vectors/Vector2.js";
import Vector3 from "../utils/Vectors/Vector3.js";

// Renderable triangle with an average depth
type RenderableTriangle = {
  p1: Vector2;
  p2: Vector2;
  p3: Vector2;
  avgDepth: number;
};

type ProjectedVertex = { position: Vector2; depth: number }; // Projected vertex with the depth available for rendering

export default class Renderer {
  private gameObject: GameObject;
  public mesh: Mesh;

  constructor(gameObject: GameObject, mesh: Mesh) {
    this.gameObject = gameObject;
    this.mesh = mesh;
  }

  update = () => {
    const projectedVertexes = this.getLocalVertexes();
    const trianglesToDraw: RenderableTriangle[] =
      this.getTriangles(projectedVertexes);
    this.render(trianglesToDraw);
  };

  /**
   * Projects the vertexes of the mesh into the screen
   * @returns an array of projected vertexes with their depth available
   */
  private getLocalVertexes(): ProjectedVertex[] {
    // Vertexes projected into the screen (from 3D points to 2D points)
    const projectedVertexes: ProjectedVertex[] = [];
    const t = this.gameObject.transform; // Short references to the transform

    for (const localVertex of this.mesh.vertexes) {
      // Temp variable for the position, so all of it's will be modified at once
      let workVec = new Vector3(
        localVertex.x * t.size.x,
        localVertex.y * t.size.y,
        localVertex.z * t.size.z,
      );

      // ROTATE
      workVec.rotateZ(t.rotation.z);
      workVec.rotateX(t.rotation.x);
      workVec.rotateY(t.rotation.y);

      // TRANSLATE
      workVec = Vector3.sum(workVec, t.position);

      // PROJECT TO SCREEN
      const screenPos = Screen.toScreen(Screen.project(workVec));

      projectedVertexes.push({ position: screenPos, depth: workVec.z });

      // this.point(screenPos);
    }
    return projectedVertexes;
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
      Screen.context.beginPath(); // Prepare the context to render
      Screen.context.moveTo(tri.p1.x, tri.p1.y); // Starting point
      Screen.context.lineTo(tri.p2.x, tri.p2.y); // Move to the second point
      Screen.context.lineTo(tri.p3.x, tri.p3.y); // Move to the third point
      Screen.context.closePath(); // Close the path

      Screen.context.fillStyle = config.foregroundColor; // Set the color
      Screen.context.fill(); // Finally draw the path
    }
  }

  /**
   * Draws a line from p1 to p2.
   * @param p1 First point
   * @param p2 Second point
   */
  private line(p1: Vector2, p2: Vector2) {
    Screen.context.strokeStyle = config.foregroundColor;
    Screen.context.lineWidth = 2;
    Screen.context.beginPath();
    Screen.context.moveTo(p1.x, p1.y);
    Screen.context.lineTo(p2.x, p2.y);
    Screen.context.stroke();
  }

  /**
   * Draws a point
   * @param p position in which the point should be drawn
   */
  private point = (p: Vector2) => {
    Screen.context.fillStyle = config.foregroundColor;
    Screen.context.fillRect(
      p.x - config.pointWidth / 2,
      p.y - config.pointWidth / 2,
      config.pointWidth,
      config.pointWidth,
    );
  };
}
