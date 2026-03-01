import Renderer from "../lib/Components/Renderer.js";
import Transform from "../lib/Components/Transform.js";
import Mesh from "../lib/Meshes/Mesh.js";
import Vector3 from "../lib/utils/Vectors/Vector3.js";

/**
 * Represents the base entity in the scene.
 * It acts as a container for components like Transform and Renderer,
 * coordinating their state and lifecycle.
 */
export default class GameObject {
  /**
   * The spatial state (Position, Rotation, Scale) of this object.
   * Readonly ensures the reference cannot be replaced, though its internal values can change.
   */
  public readonly transform: Transform;

  /**
   * The component responsible for drawing the object's mesh to the canvas.
   */
  public readonly renderer: Renderer;

  /**
   * Creates a new GameObject instance.
   * @param mesh - The geometric data (vertices/triangles) to render.
   * @param position - Initial world position.
   * @param rotation - Initial Euler rotation angles.
   * @param size - Initial scale factors.
   */
  constructor(mesh: Mesh, position: Vector3, rotation: Vector3, size: Vector3) {
    // Initialize the Transform component to handle spatial logic
    this.transform = new Transform(position, rotation, size);

    // Initialize the Renderer component, linking it to this object's transform
    this.renderer = new Renderer(this, mesh);
  }

  /**
   * Called once per frame. Propagates the update cycle to all child components.
   */
  public update(): void {
    this.transform.update();
    this.renderer.update();
  }
}
