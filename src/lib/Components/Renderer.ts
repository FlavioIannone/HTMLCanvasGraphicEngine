import GameObject from "../../GameObjects/GameObject.js";
import Camera from "../Camera/Camera.js";
import Engine from "../Engine.js";
import Mesh from "../Meshes/Mesh.js";
import Screen from "../utils/CoordinatesManagers/Screen.js";
import { Matrix4 } from "../utils/Matrices/Matrix4.js";
import { ProjectedVertex } from "../utils/Types.js";
import Vector2 from "../utils/Vectors/Vector2.js";
import Vector3 from "../utils/Vectors/Vector3.js";
import Vector4 from "../utils/Vectors/Vector4.js";

/**
 * Represents a 2D triangle ready to be drawn on the canvas.
 * Includes average depth for the Painter's Algorithm sorting.
 */
type RenderableTriangle = {
  p1: Vector2;
  p2: Vector2;
  p3: Vector2;
  avgDepth: number;
  color: string;
};

/**
 * Core Graphics Pipeline.
 * Transforms 3D local coordinates into 2D screen pixels.
 * Strictly utilizes Object Pooling to guarantee Zero-Allocation during the hot path (update loop),
 * preventing Garbage Collection stutters.
 */
export default class Renderer {
  private gameObject: GameObject;
  public mesh: Mesh;

  // --- MEMORY SCRATCHPADS ---
  // Reused across all vertices to prevent 'new VectorX()' calls in the loop.
  private _workVec4: Vector4 = new Vector4(0, 0, 0, 1);
  private _workVec3: Vector3 = new Vector3(0, 0, 0);

  // --- OBJECT POOL ---
  // A pre-allocated chunk of memory holding the maximum possible triangles.
  // We mutate these objects in-place rather than creating/destroying them.
  private _trianglesToDraw: RenderableTriangle[] = [];

  // Tracks how many pooled triangles are actually visible in the current frame
  // after Back-Face Culling.
  private _activeTriangleCount: number = 0;

  // The active camera determining the View Space.
  private _activeCamera: Camera;

  /**
   * Initializes the Renderer and pre-allocates the exact memory needed for the Mesh.
   */
  constructor(gameObject: GameObject, mesh: Mesh) {
    this.gameObject = gameObject;
    this.mesh = mesh;
    this._activeCamera = Camera.main;

    // PRE-ALLOCATION: Fill the pool once at instantiation.
    for (let i = 0; i < this.mesh.triangles.length; i++) {
      this._trianglesToDraw.push({
        p1: new Vector2(),
        p2: new Vector2(),
        p3: new Vector2(),
        avgDepth: 0,
        color: `rgb(0,0,0)`,
      });
    }
  }

  /**
   * Main rendering loop execution. Called every frame.
   * Follows the strict order: Vertex Transform -> Face Processing -> Rasterization.
   */
  update() {
    const projectedVertexes = this.getLocalVertexes();
    this.processTriangles(projectedVertexes);
    this.render();
  }

  /**
   * Translates local mesh vertices through the spatial pipeline:
   * Local Space -> World Space -> Camera Space -> Screen Space.
   * @returns An array of projected 2D vertices containing Z-depth relative to the camera.
   */
  private getLocalVertexes(): ProjectedVertex[] {
    const t = this.gameObject.transform;
    const modelMatrix = t.getModelMatrix();

    // Extracted ONCE per object to save CPU cycles.
    const viewMatrix = this._activeCamera.getLookAtMatrix();

    for (let i = 0; i < this.mesh.vertexes.length; i++) {
      const localVertex = this.mesh.vertexes[i];

      // 1. Load raw data into the scratchpad
      this._workVec4.x = localVertex.x;
      this._workVec4.y = localVertex.y;
      this._workVec4.z = localVertex.z;
      this._workVec4.w = 1;

      // 2. LOCAL TO WORLD SPACE
      // Places the object into the absolute universe.
      Matrix4.matrix4MultiplyVector4(
        this._workVec4,
        modelMatrix,
        this._workVec4,
      );

      // 3. WORLD TO CAMERA SPACE
      // Shifts the universe relative to the camera's eyes.
      // Matrix multiplication order is non-commutative: Model MUST precede View.
      Matrix4.matrix4MultiplyVector4(
        this._workVec4,
        viewMatrix,
        this._workVec4,
      );

      this._workVec3.x = this._workVec4.x;
      this._workVec3.y = this._workVec4.y;
      this._workVec3.z = this._workVec4.z;

      // 4. PERSPECTIVE PROJECTION
      Screen.project(this._workVec3, this.mesh.projectedVertexes[i].position);

      // CRITICAL DEPTH CAPTURE:
      // Save the Z value AFTER View Matrix, but BEFORE it gets warped by projection.
      // This ensures depth sorting is based on physical distance from the camera lens.
      this.mesh.projectedVertexes[i].depth = this._workVec4.z;

      // 5. NORMALIZED TO PIXELS
      Screen.toScreen(this.mesh.projectedVertexes[i].position);
    }

    return this.mesh.projectedVertexes;
  }

  /**
   * Assembles projected vertices, culls hidden faces, computes depth,
   * and sorts the active pool using the Painter's Algorithm.
   */
  private processTriangles(projectedVertexes: ProjectedVertex[]): void {
    this._activeTriangleCount = 0;

    for (let i = 0; i < this.mesh.triangles.length; i++) {
      const tri = this.mesh.triangles[i];

      const v1 = projectedVertexes[tri.vertexes[0]];
      const v2 = projectedVertexes[tri.vertexes[1]];
      const v3 = projectedVertexes[tri.vertexes[2]];

      // --- BACK-FACE CULLING (2D Cross Product Optimization) ---
      // Calculates the Z-component of the normal vector in screen space.
      // If the vertices wind clockwise (Z > 0), the face points away from the camera.
      // Skipping rendering for these saves ~50% of rasterization cost.
      const normalZ =
        (v2.position.x - v1.position.x) * (v3.position.y - v1.position.y) -
        (v2.position.y - v1.position.y) * (v3.position.x - v1.position.x);

      if (normalZ > 0) continue;

      // Retrieve the next available pooled object by reference
      const pooledTriangle = this._trianglesToDraw[this._activeTriangleCount];

      // Mutate properties directly. No new objects are created.
      pooledTriangle.p1 = v1.position;
      pooledTriangle.p2 = v2.position;
      pooledTriangle.p3 = v3.position;
      pooledTriangle.avgDepth = (v1.depth + v2.depth + v3.depth) / 3;
      pooledTriangle.color = `rgb(${tri.color[0]}, ${tri.color[1]},${tri.color[2]})`;

      this._activeTriangleCount++;
    }

    // --- PAINTER'S ALGORITHM SAFEGUARD ---
    // Push all inactive/culled triangles to negative infinity depth.
    // This prevents garbage data left in the pool from overriding active triangles during sorting.
    for (
      let j = this._activeTriangleCount;
      j < this._trianglesToDraw.length;
      j++
    ) {
      this._trianglesToDraw[j].avgDepth = -Infinity;
    }

    // Sort descending: highest Z (furthest away) gets drawn first, naturally overdrawn by closer elements.
    this._trianglesToDraw.sort((a, b) => b.avgDepth - a.avgDepth);
  }

  /**
   * Rasterizes ONLY the active, sorted triangles onto the HTML Canvas context.
   */
  private render(): void {
    // Loop only up to _activeTriangleCount, entirely ignoring culled pool elements.
    for (let i = 0; i < this._activeTriangleCount; i++) {
      const tri = this._trianglesToDraw[i];

      Engine.context.beginPath();
      Engine.context.moveTo(tri.p1.x, tri.p1.y);
      Engine.context.lineTo(tri.p2.x, tri.p2.y);
      Engine.context.lineTo(tri.p3.x, tri.p3.y);
      Engine.context.closePath();

      Engine.context.fillStyle = tri.color;
      Engine.context.fill();

      // Stroke prevents micro-gaps (seams) between adjacent triangles due to canvas anti-aliasing
      Engine.context.strokeStyle = tri.color;
      Engine.context.lineWidth = 1;
      Engine.context.stroke();
    }
  }

  public setNewActiveCamera(newCamera: Camera): void {
    this._activeCamera = newCamera;
  }
}
