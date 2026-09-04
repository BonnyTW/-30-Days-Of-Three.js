import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as dat from 'lil-gui';
import gsap from 'gsap';

const gui = new dat.GUI();
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#0a0a0c', 0.03);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let burger = null;
let explodeTimeline = null;
let isExploded = false;

gltfLoader.load(
    '/burger2.glb',
    (gltf) => {
        burger = new THREE.Group();
        const model = gltf.scene;
        burger.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const targetScale = 4 / maxDim;
            model.scale.set(targetScale, targetScale, targetScale);
        }

        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        burger.position.x = 2;
        burger.position.y = -0.5;

        const parts = [];
        
        // Enable shadows and collect parts
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                parts.push(child);
            }
        });

        // Sort the parts from bottom to top based on their bounding box center height
        parts.sort((a, b) => {
            const boxA = new THREE.Box3().setFromObject(a);
            const boxB = new THREE.Box3().setFromObject(b);
            return boxA.getCenter(new THREE.Vector3()).y - boxB.getCenter(new THREE.Vector3()).y;
        });

        // Create a GSAP timeline for the exploding animation, paused by default
        explodeTimeline = gsap.timeline({ paused: true });

        // Offset each part based on its vertical order
        parts.forEach((part, index) => {
            const middleIndex = parts.length / 2;
            const yOffset = (index - middleIndex) * 0.4; // The distance they spread apart
            
            // Animate each part's Y position
            explodeTimeline.to(part.position, {
                y: part.position.y + yOffset,
                duration: 1.2,
                ease: "power2.inOut"
            }, 0); // '0' means they all animate at the exact same time
        });

        scene.add(burger);
    }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const rimLight = new THREE.DirectionalLight(0xff4757, 2);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

const lightParams = {
    ambientColor: 0xffffff,
    directionalColor: 0xffffff,
    rimColor: 0xff4757
};

const ambientFolder = gui.addFolder('Ambient Light');
ambientFolder.add(ambientLight, 'intensity').min(0).max(10).step(0.01).name('Intensity');
ambientFolder.addColor(lightParams, 'ambientColor').onChange((value) => {
    ambientLight.color.set(value);
}).name('Color');

const dirFolder = gui.addFolder('Directional Light');
dirFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('Intensity');
dirFolder.addColor(lightParams, 'directionalColor').onChange((value) => {
    directionalLight.color.set(value);
}).name('Color');
dirFolder.add(directionalLight.position, 'x').min(-20).max(20).step(0.01).name('Position X');
dirFolder.add(directionalLight.position, 'y').min(-20).max(20).step(0.01).name('Position Y');
dirFolder.add(directionalLight.position, 'z').min(-20).max(20).step(0.01).name('Position Z');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;
});

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(2, 0, 8); // Centered on burger
scene.add(camera);

const raycaster = new THREE.Raycaster();

window.addEventListener('dblclick', () => {
    if (burger && explodeTimeline) {
        raycaster.setFromCamera(mouse, camera);
        
        // Check intersections with the burger's parts
        const intersects = raycaster.intersectObject(burger, true);
        
        if (intersects.length > 0) {
            if (!isExploded) {
                explodeTimeline.play();
            } else {
                explodeTimeline.reverse();
            }
            isExploded = !isExploded;
        }
    }
});

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.target.set(2, -0.5, 0);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#0a0a0c');
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    if (burger) {
        burger.rotation.y += 0.2 * deltaTime;
        burger.position.y = -0.5 + Math.sin(elapsedTime * 2) * 0.1;
        burger.rotation.x = mouse.y * 0.1;
        burger.rotation.z = -mouse.x * 0.1;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
