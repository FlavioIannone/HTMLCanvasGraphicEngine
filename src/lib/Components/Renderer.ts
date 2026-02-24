import config from "../../game.config.js";
import GameObject from "../../GameObjects/GameObject.js";
import Mesh from "../Meshes/Mesh.js";
import { Vector2 } from "../utils/Types.js";
import Vector3 from "../utils/Vector3.js";

// Renderable triangle with an average depth
type RenderableTriangle = {
  p1: Vector2;
  p2: Vector2;
  p3: Vector2;
  avgDepth: number;
};

type ProjectedVertex = { position: Vector2; depth: number }; // Projected vertex with the depth available for rendering

export default class Renderer {
  private context: CanvasRenderingContext2D;
  private gameObject: GameObject;
  public mesh: Mesh;

  constructor(
    gameObject: GameObject,
    context: CanvasRenderingContext2D,
    mesh: Mesh,
  ) {
    this.gameObject = gameObject;
    this.context = context;
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
      const screenPos = this.toScreen(this.project(workVec));

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
      this.context.beginPath(); // Prepare the context to render
      this.context.moveTo(tri.p1.x, tri.p1.y); // Starting point
      this.context.lineTo(tri.p2.x, tri.p2.y); // Move to the second point
      this.context.lineTo(tri.p3.x, tri.p3.y); // Move to the third point
      this.context.closePath(); // Close the path

      this.context.fillStyle = config.foregroundColor; // Set the color
      this.context.fill(); // Finally draw the path
    }
  }

  /**
   * Draws a line from p1 to p2.
   * @param p1 First point
   * @param p2 Second point
   */
  private line(p1: Vector2, p2: Vector2) {
    this.context.strokeStyle = config.foregroundColor;
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(p1.x, p1.y);
    this.context.lineTo(p2.x, p2.y);
    this.context.stroke();
  }

  /**
   * Draws a point
   * @param p position in which the point should be drawn
   */
  private point = (p: Vector2) => {
    this.context.fillStyle = config.foregroundColor;
    this.context.fillRect(
      p.x - config.pointWidth / 2,
      p.y - config.pointWidth / 2,
      config.pointWidth,
      config.pointWidth,
    );
  };

  /**
   * Converts a point from Normalized Device Coordinates (NDC) to Screen Space (Pixels).
   * * Input Assumption:
   * The input point 'p' must be in the range [-1, 1].
   * - (-1, -1) is Bottom-Left in 3D space.
   * - (1, 1) is Top-Right in 3D space.
   *
   * Maps the point to the canvas pixel dimensions, handling the Y-axis inversion.
   * @param p - A point in NDC space (x: -1 to 1, y: -1 to 1).
   * @returns A point in Screen Space (x: 0 to width, y: 0 to height).
   */
  private toScreen(p: Vector2): Vector2 {
    return {
      x: ((p.x + 1) / 2) * config.width,
      y: (1 - (p.y + 1) / 2) * config.height,
    };
  }

  /**
   * Projects a 3D point into the 2D space of the screen
   * @param p point to project
   * @returns the projected point
   */
  private project(p: Vector3): Vector2 {
    if (p.z === 0) return { x: p.x, y: p.y };

    return {
      x: p.x / p.z,
      y: p.y / p.z,
    };
  }
}
