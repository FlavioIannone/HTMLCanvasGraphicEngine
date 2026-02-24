# 🧊 TypeScript Software Renderer

A lightweight 3D rendering engine built entirely from scratch in **TypeScript**.

This project does **not** use WebGL, Three.js, or any external graphics libraries. It implements a full 3D pipeline using pure mathematics and renders geometry to the HTML5 Canvas via the **2D Context**.

## 🎯 Motivation

The goal of this project is to understand the fundamental mathematics behind computer graphics. By reinventing the wheel, we explore how vertices, edges, and faces are transformed from 3D local space to 2D screen coordinates using:

- **Trigonometry & Linear Algebra:** Manual rotation and translation logic.
- **World-to-Screen Projection:** Perspective math using Z-division.
- **Rasterization:** Triangle filling and wireframe rendering.
- **Depth Sorting:** Implementation of the **Painter's Algorithm** to handle face visibility.

## ✨ Features

- **Zero Dependencies:** No graphics libraries, just pure TypeScript logic.
- **Custom Math Library:** Dedicated `Vector3` class with support for vector addition and Euler rotations.
- **Component-Based Architecture:** Modular design with `GameObject`, `Transform`, and `Renderer` components.
- **Procedural Meshes:** Dynamic generation of `Cube`, `Sphere`, and `Circle` geometries.
- **Rendering Pipeline:**
  - **S.R.T. Order:** Scaled, Rotated, and Translated vertices.
  - **Perspective Projection:** Simulates depth by scaling based on distance.
  - **Y-Axis Inversion:** Corrects the coordinate difference between 3D space and Canvas pixel space.
- **Painter's Algorithm:** Sorting of triangles by average Z-depth to prevent rendering artifacts.
- **Advanced Time Management:** Singleton `Time` class providing frame-rate independent `deltaTime`.

## 🤝 Join the Development

This project is a **learning playground**. We are deliberately "reinventing the wheel" to understand the core mathematics of 3D graphics.

Whether you are a math wizard, a TypeScript enthusiast, or a beginner wanting to learn how a 3D engine works under the hood, **your contribution is welcome!**

### 💡 How You Can Help

Found a bug or a wrong calculation? Open an Issue or submit a Pull Request!
