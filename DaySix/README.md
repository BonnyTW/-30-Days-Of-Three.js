# Day Six: 3D Text and Typography in Three.js

## Overview
In this day's project, we focused on generating and manipulating 3D text in a Three.js scene. We explored how to load custom fonts, convert them into 3D geometries, and populate the surrounding environment with floating 3D objects to create a dynamic and professional cinematic scene.

## What I Learned

### `FontLoader`
Standard web fonts (`.ttf` or `.woff`) cannot be used directly to generate 3D geometry because Three.js needs precise mathematical curves and paths.
- I learned how to use `FontLoader` to asynchronously load `.json` typeface files.
- Since loading takes time, the actual text generation must occur inside a callback function that executes only after the font is successfully fetched.

### `TextGeometry` (formerly `TextBufferGeometry`)
Once the font data is available, it is passed to `TextGeometry` to extrude a 2D string into a 3D mesh.
- **Key Parameters:** I explored settings like `size` and `height` (extrusion depth).
- **Beveling:** Adding bevels (`bevelEnabled`, `bevelThickness`, `bevelSize`, etc.) is crucial for giving 3D text rounded, realistic edges that catch lighting properly, making it look much more polished and less blocky.
- **Centering:** I used `geometry.center()` to adjust the geometry's bounding box, ensuring the text rotates around its exact center rather than its bottom-left corner.

### Surrounding Environment & Optimization
- **Multiple Meshes:** We generated multiple floating 3D objects (like Toruses) distributed randomly around the text to create a more immersive composition.
- **Material Reuse:** To keep performance high, I learned the importance of reusing a single `Material` and `Geometry` instance when generating hundreds of background objects, instead of creating new instances for every single mesh.

## What I Did
- Set up a foundational Three.js scene with `WebGLRenderer`, a `PerspectiveCamera`, and `OrbitControls`.
- Implemented `FontLoader` to fetch a typeface font.
- Generated a "Hello Three.js" 3D text object using `TextGeometry`, centering it perfectly in the view.
- Added materials to the text to react realistically to the scene.
- Populated the background with a loop generating numerous 3D Torus geometries, giving them random positions, rotations, and scales.
- Added an animation loop that renders the scene smoothly and allows for interactive camera controls.
