import config from "../../game.config.js";
import GameObject from "../../GameObjects/GameObject.js";
import Camera from "../Camera/Camera.js";
import Engine from "../Engine.js";
import Mesh from "../Meshes/Mesh.js";
import Screen from "../utils/CoordinatesManagers/Screen.js";
import MathUtils from "../utils/MathUtils/MathUtils.js";
import { Matrix4 } from "../utils/Matrices/Matrix4.js";
import Vector2 from "../utils/Vectors/Vector2.js";
import Vector3 from "../utils/Vectors/Vector3.js";
import Vector4 from "../utils/Vectors/Vector4.js";

/**
 * Represents a 3D triangle in Camera Space.
 */
type CameraSpaceTriangle = {
  p1: Vector3;
  p2: Vector3;
  p3: Vector3;
  color: string;
};

/**
 * Represents a 2D triangle ready for the canvas.
 */
type RenderableTriangle = {
  p1: Vector2;
  p2: Vector2;
  p3: Vector2;
  avgDepth: number;
  color: string;
};

export default class Renderer {
  private gameObject: GameObject;
  public mesh: Mesh;

  // --- MEMORY SCRATCHPADS ---
  private _workVec4: Vector4 = new Vector4(0, 0, 0, 1);
  private _workVec3: Vector3 = new Vector3(0, 0, 0);
  private _modelViewMatrix4: Matrix4 = new Matrix4();

  // --- OBJECT POOLS ---
  private _cameraSpaceTriangles: CameraSpaceTriangle[] = [];
  private _trianglesToDraw: RenderableTriangle[] = [];

  // --- COUNTERS ---
  private _activeCameraTriangleCount: number = 0;
  private _activeTriangleCount: number = 0;

  private _activeCamera: Camera;

  constructor(gameObject: GameObject, mesh: Mesh) {
    this.gameObject = gameObject;
    this.mesh = mesh;
    this._activeCamera = Camera.main;

    const maxPossibleTriangles = this.mesh.triangles.length * 2;

    for (let i = 0; i < maxPossibleTriangles; i++) {
      this._cameraSpaceTriangles.push({
        p1: new Vector3(),
        p2: new Vector3(),
        p3: new Vector3(),
        color: `rgb(0,0,0)`,
      });
      this._trianglesToDraw.push({
        p1: new Vector2(),
        p2: new Vector2(),
        p3: new Vector2(),
        avgDepth: 0,
        color: `rgb(0,0,0)`,
      });
    }
  }

  update() {
    this.getCameraSpaceVertexes();
    this.assembleAndClipTriangles();
    this.projectAndSortTriangles();
    this.render();
  }

  /**
   * PHASE 1: VERTEX TRANSFORM (3D)
   * Combines Model and View matrices to transform all vertices in a single pass.
   */
  private getCameraSpaceVertexes() {
    const t = this.gameObject.transform;
    const modelMatrix = t.getModelMatrix();
    const viewMatrix = this._activeCamera.getLookAtMatrix();

    // PERFORMANCE: Pre-multiply View * Model (Column-Major order)
    Matrix4.multiplyMatrix4(viewMatrix, modelMatrix, this._modelViewMatrix4);

    for (let i = 0; i < this.mesh.vertexes.length; i++) {
      const v = this.mesh.vertexes[i];
      this._workVec4.x = v.x;
      this._workVec4.y = v.y;
      this._workVec4.z = v.z;
      this._workVec4.w = 1;

      Matrix4.matrix4MultiplyVector4(
        this._workVec4,
        this._modelViewMatrix4,
        this._workVec4,
      );

      // Copy values to mesh buffer (avoid pointer corruption)
      const target = this.mesh.cameraSpaceVertexes[i];
      target.x = this._workVec4.x;
      target.y = this._workVec4.y;
      target.z = this._workVec4.z;
    }
  }

  /**
   * PHASE 2: GEOMETRY ASSEMBLY & CLIPPING (3D)
   * Handles Near-Plane clipping by generating new triangles when segments pierce the Z-Near threshold.
   */
  private assembleAndClipTriangles() {
    this._activeCameraTriangleCount = 0;
    const z_near = config.screenConfig.z_near;

    for (let i = 0; i < this.mesh.triangles.length; i++) {
      const tri = this.mesh.triangles[i];
      const v1 = this.mesh.cameraSpaceVertexes[tri.vertexes[0]];
      const v2 = this.mesh.cameraSpaceVertexes[tri.vertexes[1]];
      const v3 = this.mesh.cameraSpaceVertexes[tri.vertexes[2]];

      const d1 = v1.z - z_near;
      const d2 = v2.z - z_near;
      const d3 = v3.z - z_near;

      let insideCount = 0;
      if (d1 >= 0) insideCount++;
      if (d2 >= 0) insideCount++;
      if (d3 >= 0) insideCount++;

      // --- CASE A: TRIVIAL REJECT (0 inside) ---
      if (insideCount === 0) continue;

      const triColor = `rgb(${tri.color[0]},${tri.color[1]},${tri.color[2]})`;

      // --- CASE B: TRIVIAL ACCEPT (3 inside) ---
      if (insideCount === 3) {
        const camTri =
          this._cameraSpaceTriangles[this._activeCameraTriangleCount++];
        Vector3.copyTo(v1, camTri.p1);
        Vector3.copyTo(v2, camTri.p2);
        Vector3.copyTo(v3, camTri.p3);
        camTri.color = triColor;
        continue;
      }

      // --- GEOMETRIC ROTATION ---
      // We rotate the vertices circularly (preserving winding) so that v0 is ALWAYS the "isolated" vertex.
      let v0: Vector3, v1_mod: Vector3, v2_mod: Vector3;

      // CASE C: 1 Valid, 2 Invalid (Isolated is the VALID one)
      if (insideCount === 1) {
        if (d1 >= 0) {
          v0 = v1;
          v1_mod = v2;
          v2_mod = v3;
        } else if (d2 >= 0) {
          v0 = v2;
          v1_mod = v3;
          v2_mod = v1;
        } else {
          v0 = v3;
          v1_mod = v1;
          v2_mod = v2;
        }

        const camTri =
          this._cameraSpaceTriangles[this._activeCameraTriangleCount++];

        // 1. Point 1 is the valid vertex
        Vector3.copyTo(v0, camTri.p1);

        // 2. Point 2 is the intersection between valid and first invalid
        const t1 = MathUtils.getPlaneIntersectionFactor(z_near, v0.z, v1_mod.z);
        Vector3.lerp(v0, v1_mod, t1, camTri.p2);

        // 3. Point 3 is the intersection between valid and second invalid
        const t2 = MathUtils.getPlaneIntersectionFactor(z_near, v0.z, v2_mod.z);
        Vector3.lerp(v0, v2_mod, t2, camTri.p3);

        camTri.color = triColor;
      }

      // CASE D: 2 Valid, 1 Invalid (Isolated is the INVALID one)
      else if (insideCount === 2) {
        if (d1 < 0) {
          v0 = v1;
          v1_mod = v2;
          v2_mod = v3;
        } else if (d2 < 0) {
          v0 = v2;
          v1_mod = v3;
          v2_mod = v1;
        } else {
          v0 = v3;
          v1_mod = v1;
          v2_mod = v2;
        }

        // Here v1_mod and v2_mod are the two VALID vertices.
        const tri1 =
          this._cameraSpaceTriangles[this._activeCameraTriangleCount++];
        const tri2 =
          this._cameraSpaceTriangles[this._activeCameraTriangleCount++];

        // Triangle 1: (Valid1, Valid2, Intersection between Valid1 and Invalid)
        Vector3.copyTo(v1_mod, tri1.p1);
        Vector3.copyTo(v2_mod, tri1.p2);
        const t1 = MathUtils.getPlaneIntersectionFactor(z_near, v1_mod.z, v0.z);
        Vector3.lerp(v1_mod, v0, t1, tri1.p3);
        tri1.color = triColor;

        // Triangle 2: (Intersection1, Valid2, Intersection between Valid2 and Invalid)
        Vector3.copyTo(tri1.p3, tri2.p1);
        Vector3.copyTo(v2_mod, tri2.p2);
        const t2 = MathUtils.getPlaneIntersectionFactor(z_near, v2_mod.z, v0.z);
        Vector3.lerp(v2_mod, v0, t2, tri2.p3);
        tri2.color = triColor;
      }
    }
  }

  /**
   * PHASE 3: PROJECTION & SORT (2D)
   */
  private projectAndSortTriangles() {
    this._activeTriangleCount = 0;

    for (let i = 0; i < this._activeCameraTriangleCount; i++) {
      const camTri = this._cameraSpaceTriangles[i];
      const screenTri = this._trianglesToDraw[this._activeTriangleCount];

      Screen.project(camTri.p1, screenTri.p1);
      Screen.project(camTri.p2, screenTri.p2);
      Screen.project(camTri.p3, screenTri.p3);

      Screen.toScreen(screenTri.p1);
      Screen.toScreen(screenTri.p2);
      Screen.toScreen(screenTri.p3);

      // Back-face Culling
      const normalZ =
        (screenTri.p2.x - screenTri.p1.x) * (screenTri.p3.y - screenTri.p1.y) -
        (screenTri.p2.y - screenTri.p1.y) * (screenTri.p3.x - screenTri.p1.x);

      if (normalZ > 0) continue;

      screenTri.avgDepth = (camTri.p1.z + camTri.p2.z + camTri.p3.z) / 3;
      screenTri.color = camTri.color;
      this._activeTriangleCount++;
    }

    // Sort for Painter's Algorithm
    for (
      let j = this._activeTriangleCount;
      j < this._trianglesToDraw.length;
      j++
    ) {
      this._trianglesToDraw[j].avgDepth = -Infinity;
    }
    this._trianglesToDraw.sort((a, b) => b.avgDepth - a.avgDepth);
  }

  /**
   * PHASE 4: RASTERIZATION
   */
  private render(): void {
    for (let i = 0; i < this._activeTriangleCount; i++) {
      const tri = this._trianglesToDraw[i];
      Engine.context.beginPath();
      Engine.context.moveTo(tri.p1.x, tri.p1.y);
      Engine.context.lineTo(tri.p2.x, tri.p2.y);
      Engine.context.lineTo(tri.p3.x, tri.p3.y);
      Engine.context.closePath();
      Engine.context.fillStyle = tri.color;
      Engine.context.fill();
      Engine.context.strokeStyle = tri.color;
      Engine.context.lineWidth = 1;
      Engine.context.stroke();
    }
  }

  public setNewActiveCamera(newCamera: Camera): void {
    this._activeCamera = newCamera;
  }
}
