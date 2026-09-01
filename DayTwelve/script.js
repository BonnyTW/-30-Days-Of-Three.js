import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();




const pointLight = new THREE.PointLight(0xffffff, 10);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true



// Sphreshape pasrticles

// const pointGeo = new THREE.SphereGeometry(1, 32, 32)
// const pointmat = new THREE.PointsMaterial({
//     size: 0.02, sizeAttenuation: true
// })

// const point = new THREE.Points(pointGeo, pointmat)
// scene.add(point)



//random particles

const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('./PNG (Black background)/star_04.png')

const count = 20000
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 5
    colors[i] = Math.random()
}

const geo = new THREE.BufferGeometry()
const mat = new THREE.PointsMaterial({
    size: 0.1, // Sets the base size of each particle
    sizeAttenuation: true, // Makes particles appear smaller as they get further from the camera

    transparent: true, // Enables transparency so the alpha map can take effect
    alphaMap: particleTexture, // Uses the texture's brightness values to control opacity
    alphaTest: 0.02, // Discards pixels below this alpha threshold to prevent depth sorting bugs
    vertexColors: true, // Tells the material to use the custom 'color' BufferAttribute we provided
    blending: THREE.AdditiveBlending
})

geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const points = new THREE.Points(geo, mat)

scene.add(points)









/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();


    // points.rotaion.y =  elapsedTime * 0.2


    for (let i = 0; i < count; i++) {

        // The position array is flat: [x, y, z,  x, y, z,  x, y, z...]
        // So particle 0 is at indices 0,1,2. Particle 1 is at 3,4,5. 
        // We multiply the particle index (i) by 3 to find its starting position.
        const i3 = i * 3

        // i3 is the X coordinate, i3 + 1 is Y, i3 + 2 is Z
        const x = geo.attributes.position.array[i3]

        // Update the Y coordinate (i3 + 1) using a sine wave based on time and its X position
        geo.attributes.position.array[i3 + 1] = Math.sin(x + elapsedTime)
    }

    // You MUST tell Three.js that you changed the array, or the GPU won't update the positions on screen
    geo.attributes.position.needsUpdate = true



    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
