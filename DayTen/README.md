# Day 10: First-Person Movement & Collision Detection

In this project, I implemented first-person movement controls using `PointerLockControls` and built a basic Axis-Aligned Bounding Box (AABB) collision detection system to prevent the player from walking through obstacles in the scene.

## What I Learned
- How to lock the user's cursor for first-person viewing (similar to FPS games).
- Calculating movement based on velocity, direction, and delta time (`clock.getDelta()`) to ensure smooth performance across different framerates.
- Generating bounding boxes (`THREE.Box3`) for scene objects and the player's camera.
- Using intersection tests to detect when the player's path is blocked and snapping their position back to prevent moving through solid walls.

## Methods & Classes Used

### `PointerLockControls(camera, domElement)`
- **Purpose:** A control class that locks the mouse to the document, allowing the user to rotate the camera infinitely without the cursor leaving the screen.
- **Arguments:** 
  - `camera`: The camera to be controlled (e.g., `PerspectiveCamera`).
  - `domElement`: The HTML element to listen to for mouse events (usually `document.body`).

### `THREE.Box3()`
- **Purpose:** Represents an Axis-Aligned Bounding Box (AABB) in 3D space. It's used for mathematical operations like boundary calculations and collision detection.
- **Arguments:** By default, it takes no arguments (or min/max vectors), initializing an empty bounding box.

### `setFromObject(object)` (on `Box3`)
- **Purpose:** Computes the world-space bounding box of a specific 3D object (including its children) and updates the `Box3` to fit it exactly.
- **Arguments:** 
  - `object`: The `THREE.Mesh` or `Object3D` to calculate the bounds for.

### `setFromCenterAndSize(center, size)` (on `Box3`)
- **Purpose:** Defines the dimensions of a bounding box by specifying its center point and its width, height, and depth. Used in this project to represent a "player" bounding box around the camera.
- **Arguments:**
  - `center`: A `THREE.Vector3` representing the center point of the box.
  - `size`: A `THREE.Vector3` representing the total width, height, and depth of the box.

### `intersectsBox(box)` (on `Box3`)
- **Purpose:** Checks if the current bounding box overlaps with another bounding box. Returns `true` if they collide, and `false` otherwise.
- **Arguments:**
  - `box`: Another `THREE.Box3` to test for intersection against.

### `clock.getDelta()` (on `THREE.Clock`)
- **Purpose:** Gets the seconds passed since the last time this method was called (the time between frames). Critical for making animations and movement framerate-independent.
- **Arguments:** None.

### `THREE.Fog(color, near, far)`
- **Purpose:** Adds linear fog to the scene, making objects fade to a specific color as they get further away from the camera.
- **Arguments:**
  - `color`: The color of the fog (hex string or `THREE.Color`).
  - `near`: The distance from the camera at which fog starts applying.
  - `far`: The distance from the camera at which fog is at maximum density.
