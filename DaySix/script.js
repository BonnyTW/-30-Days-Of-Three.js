import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d0d0d');
scene.fog = new THREE.Fog('#0d0d0d', 10, 50);

// Sizes
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

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 20); // Cinematic starting position
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Materials
const textMaterial = new THREE.MeshStandardMaterial({
    color: '#ffecd1', // Soft warm cream/gold
    roughness: 0.1,
    metalness: 0.7,
});

const donutMaterial = new THREE.MeshStandardMaterial({
    color: '#1e293b', // Deep matte slate blue
    roughness: 0.7,
    metalness: 0.1,
});

// Fonts
const fontLoader = new FontLoader();
let textMesh;

fontLoader.load(
    'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry('DaySix of ThreeJS', {
            font: font,
            size: 2,
            depth: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.04,
            bevelOffset: 0,
            bevelSegments: 5
        });

        textGeometry.center();

        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;
        scene.add(textMesh);
    }
);

// Donuts
const donuts = [];
const donutGeometry = new THREE.TorusGeometry(0.3, 0.15, 20, 45);

for (let i = 0; i < 150; i++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial);

    donut.position.x = (Math.random() - 0.5) * 30;
    donut.position.y = (Math.random() - 0.5) * 30;
    donut.position.z = (Math.random() - 0.5) * 30 - 5; // keep behind/around text mostly

    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    const scale = Math.random() * 2 + 0.5;
    donut.scale.set(scale, scale, scale);

    donut.castShadow = true;
    donut.receiveShadow = true;

    scene.add(donut);
    donuts.push({
        mesh: donut,
        speedX: (Math.random() - 0.5) * 0.005,
        speedY: (Math.random() - 0.5) * 0.005,
        floatSpeed: Math.random() * 0.01,
        floatOffset: Math.random() * Math.PI * 2
    });
}

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Add colored point lights for cinematic dramatic effect
const pointLight1 = new THREE.PointLight('#ff4000', 3, 20);
pointLight1.position.set(-5, 0, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight('#0055ff', 3, 20);
pointLight2.position.set(5, -2, 2);
scene.add(pointLight2);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Animation
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Cinematic camera movement (starts far and zooms in slightly)
    if (camera.position.z > 12) {
        camera.position.z -= 0.05;
    }

    // Update donuts
    for (const donutData of donuts) {
        donutData.mesh.rotation.x += donutData.speedX;
        donutData.mesh.rotation.y += donutData.speedY;
        donutData.mesh.position.y += Math.sin(elapsedTime + donutData.floatOffset) * donutData.floatSpeed;
    }

    // Add subtle floating to the text
    if (textMesh) {
        textMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.2;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
