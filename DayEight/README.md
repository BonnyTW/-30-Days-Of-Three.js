# Day Eight - Three.js Shooting Range

In this day's practice, I built a First-Person Shooter (FPS) style target practice range using Three.js and GSAP for animations. 

Here is a breakdown of the key Three.js methods and concepts I learned and used to build the shooting mechanic:

## 1. Raycaster (The Invisible Laser)
The `Raycaster` is used to figure out what 3D objects the user's mouse/crosshair is pointing at.

- **`new THREE.Raycaster()`**: Creates the invisible laser beam.
- **`raycaster.setFromCamera(mouse, camera)`**: 
  - *Purpose*: Aims the laser beam.
  - *Arguments*: 
    - `mouse`: A 2D Vector (X, Y) representing where on the screen we are aiming (we used `0, 0` for the exact center).
    - `camera`: The camera we are looking through.
- **`raycaster.intersectObjects(objects, recursive)`**: 
  - *Purpose*: Fires the laser and returns an array of everything it touched, from closest to furthest.
  - *Arguments*:
    - `objects`: An array of all the 3D meshes it is allowed to hit (like targets and walls).
    - `recursive`: A boolean (`true`/`false`). If `false`, it won't check the children of the objects.

## 2. Object & Math Methods
- **`object.clone()`**:
  - *Purpose*: Creates a completely independent copy of an object (like a material). 
  - *Why it's useful*: If multiple meshes share the exact same material, changing the color of one will change the color of all of them. Cloning ensures each mesh has its own separate material copy.
- **`mesh.add(child1, child2)`**:
  - *Purpose*: Groups objects together by attaching child meshes to a parent mesh.
  - *Note*: You can access these attached pieces later using `mesh.children[0]`, `mesh.children[1]`, etc., in the exact order they were added.
- **`mesh.userData`**:
  - *Purpose*: An empty "backpack" object built into every Three.js mesh. It is provided specifically for developers to store custom game variables (like `isHit`, `points`, `speed`) directly on the 3D object itself.

## 3. Position and Rotation Vectors (`Vector3`)
- **`destination.copy(vector)`**:
  - *Purpose*: Safely copies the X, Y, Z values from one point to another without permanently linking the two variables together.
  - *Arguments*: The target 3D vector to copy from.
- **`position.distanceTo(destination)`**:
  - *Purpose*: Calculates the exact straight-line distance between two 3D points. 
  - *Arguments*: The destination 3D vector you want to measure the distance to.
- **`position.add(offset)`**:
  - *Purpose*: Shifts an object's position by adding the X, Y, and Z values of another vector. Used to move the bullet from the center of the camera down to the right hand (creating the FPS gun illusion).
  - *Arguments*: A `Vector3` representing how far to shift on each axis.
- **`offset.applyQuaternion(camera.quaternion)`**:
  - *Purpose*: Rotates a vector to perfectly match the rotation of another object. We used this to make sure the bullet offset rotates to match wherever the player's camera is looking.
  - *Arguments*: A "quaternion" (the mathematical way Three.js calculates 3D rotation).

## 4. Memory Management
- **`geometry.dispose()` & `material.dispose()`**:
  - *Purpose*: Permanently deletes geometry and material data from the computer's graphics card memory.
  - *Why it's useful*: When you remove a bullet from the scene (`scene.remove()`), its shape and color still stay in memory. Using `.dispose()` cleans it up completely, preventing the game from lagging or crashing after firing hundreds of bullets.
