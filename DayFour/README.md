# Day 4: Textures in Three.js

Today, I learned how to apply and manipulate textures (images) on 3D objects in Three.js. Here is a breakdown of what I learned and what each concept is used for in simple terms:

## 1. Loading Textures
- **Native Image vs `TextureLoader`**: We can load images using standard JavaScript `Image` objects, but we have to manually tell Three.js when it's done loading using `needsUpdate = true`. Using `THREE.TextureLoader` is much simpler and does this for us automatically behind the scenes.
- **`LoadingManager`**: Used when you have multiple images/textures. It tracks the progress of all downloads so you can create a loading screen or know exactly when everything is ready.

## 2. Manipulating Textures
- **`repeat`**: Used to tile an image across a surface (e.g., making a brick wall from a single brick image). 
- **`wrapS` & `wrapT`**: Tell the texture what to do when it repeats. `RepeatWrapping` loops it normally, while `MirroredRepeatWrapping` flips it backwards and forwards like a kaleidoscope to hide obvious seams.
- **`offset`**: Slides or shifts the image across the object. Great for animating things like flowing water, scrolling screens, or glitch effects!
- **`rotation` & `center`**: Rotates the texture in 2D space on the face of the object. `center` is used to change the pivot point (e.g., rotating from the exact center instead of the bottom corner).

## 3. Filters and Optimization
- **Mipmapping**: WebGL automatically creates smaller, blurrier versions of our textures to save memory when objects are far away. 
- **Filters (`minFilter` & `magFilter`)**: Dictate how the texture scales. 
  - `LinearFilter` (default) blurs the image smoothly.
  - `NearestFilter` keeps the image perfectly sharp and blocky (like Minecraft or pixel art). When using `NearestFilter`, we usually turn off Mipmaps (`generateMipmaps = false`) so it doesn't try to blur it at a distance.

## Projects
- Added a basic texture to a cube in the main directory.
- Built an animated "Glitch Art" project inside the `GlitchArt` folder combining all these concepts!
