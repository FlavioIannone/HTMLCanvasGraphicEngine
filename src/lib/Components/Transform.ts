import Vector3 from "../utils/Vectors/Vector3.js";

/**
 * Encapsulates the spatial state of a GameObject, including its translation,
 * rotation, and scale within the 3D world.
 */
export default class Transform {
  /** The absolute position of the object in world space. */
  position: Vector3;

  /** The rotation of the object represented as Euler angles (Pitch, Yaw, Roll). */
  rotation: Vector3;

  /** The scale/dimensions of the object relative to its local origin. */
  size: Vector3;

  /**
   * @param position - Initial world coordinates.
   * @param rotation - Initial orientation in radians.
   * @param size - Initial scale factors.
   */
  constructor(position: Vector3, rotation: Vector3, size: Vector3) {
    this.position = position;
    this.rotation = rotation;
    this.size = size;
  }

  /**
   * Lifecycle method called every frame to update transformation logic.
   */
  update(): void {}

  /**
   * Sets the object's orientation.
   * @param rotation - The new rotation vector to apply.
   */
  rotate(rotation: Vector3): void {
    this.rotation = rotation;
  }

  /**
   * Sets the object's position.
   * @param position - The new position coordinates to apply.
   */
  translate(position: Vector3): void {
    this.position = position;
  }
}
