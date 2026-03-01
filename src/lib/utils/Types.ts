import Transform from "../Components/Transform.js";

export type Vertexes = {
  transform: Transform;
};

export type Edge = { vx1: number; vx2: number };

export type Triangle = [number, number, number];

export type ScreenConfig = {
  width: number;
  height: number;
  fov: number;
  z_near: number;
  z_far: number;
};
