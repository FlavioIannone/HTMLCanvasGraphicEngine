import Transform from "../Components/Transform.js";

export type Vector2 = {
  x: number;
  y: number;
};

export type Vertexes = {
  transform: Transform;
};

export type Edge = { vx1: number; vx2: number };

export type Triangle = [number, number, number];
