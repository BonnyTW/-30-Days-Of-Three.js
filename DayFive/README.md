# -30-Days-Of-Three.js

## Day 5: Environment Maps and HDR Lighting

Today we focused on adding hyper-realistic lighting and reflections to 3D scenes using Environment Maps. We learned two different methods to achieve this:

### 1. CubeTextureLoader
- **What it is:** A loader that takes 6 separate standard images (px, nx, py, ny, pz, nz) and stitches them together to create a "box" around the scene.
- **Why we use it:** It's the classic method for creating basic skyboxes and simple backgrounds.
- **How to apply:** We must load the 6 images and then apply the result to `scene.background` and `scene.environment`.

### 2. RGBELoader (HDR files)
- **What it is:** A loader that takes a single `.hdr` (High Dynamic Range) image and wraps it around the scene like a sphere (using Equirectangular mapping).
- **Why we use it:** HDR files are special because they contain **real lighting data** (light values that are brighter than standard white). Instead of just acting as a background, they cast hyper-realistic light and reflections onto our meshes (especially `MeshStandardMaterial` when using `metalness`). It is the modern standard for achieving photorealism in 3D!
- **How to apply:** We load the single file, set its mapping to `THREE.EquirectangularReflectionMapping`, and apply it to the scene.

---

## Materials & Lights

We also covered various materials and lights. Here is a simple breakdown of what they are and when to use them:

### Materials
- **MeshBasicMaterial:** Flat color or texture. It **does not** react to light (always visible).
- **MeshNormalMaterial:** Colorful material based on the direction the face is pointing. Great for debugging geometry!
- **MeshMatcapMaterial:** Fakes lighting and reflections using a reference picture. Great for performance because it doesn't require real lights!
- **MeshLambertMaterial:** Soft, matte material that reacts to light. **(Requires Light)**
- **MeshPhongMaterial:** Glossy, shiny material that reacts to light. **(Requires Light)**
- **MeshToonMaterial:** Creates a cell-shaded, cartoonish look. **(Requires Light)**
- **MeshStandardMaterial:** The modern, realistic standard. Uses `roughness` and `metalness` to simulate real-world physics. Works perfectly with Environment Maps! **(Requires Light)**

### Lights
- **AmbientLight:** Illuminates everything in the scene equally from all directions. It has no source or direction. Good for adding a "base" level of brightness so the dark parts aren't pitch black.
- **PointLight:** Shoots light from a specific point in space in all directions (exactly like a lightbulb). Perfect for illuminating specific areas or casting dynamic reflections.
