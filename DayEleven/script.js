import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

// --------------------------------------------------------
// HTML ELEMENTS
// --------------------------------------------------------
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');
const entryOverlay = document.getElementById('entry-overlay');
const enterBtn = document.getElementById('enter-btn');
const crosshair = document.getElementById('crosshair');
const crosshairDot = document.querySelector('.crosshair-dot');
const hud = document.getElementById('hud');
const exhibitHint = document.getElementById('exhibit-hint');
const configPanel = document.getElementById('config-panel');
const exitConfigBtn = document.getElementById('exit-config-btn');
const configTitle = document.getElementById('config-title');
const configSpecs = document.getElementById('config-specs');

// --------------------------------------------------------
// SCENE, CAMERA, RENDERER
// --------------------------------------------------------
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#050505');
scene.fog = new THREE.FogExp2('#050505', 0.02);

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1.7, 12);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// --------------------------------------------------------
// LOADING MANAGER
// --------------------------------------------------------
const loadingManager = new THREE.LoadingManager(
    () => {
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            entryOverlay.style.display = 'flex';
        }, 500);
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        progressFill.style.width = `${(itemsLoaded / itemsTotal) * 100}%`;
    }
);
const fontLoader = new FontLoader(loadingManager);

// --------------------------------------------------------
// STATE & CONTROLS
// --------------------------------------------------------
let isConfiguring = false;
let selectedCar = null;
let preConfigCameraPos = new THREE.Vector3();
let preConfigCameraQuat = new THREE.Quaternion();

// 1. Pointer Lock (Walking)
const pointerControls = new PointerLockControls(camera, document.body);

// 2. Orbit Controls (Inspecting)
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enabled = false;
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go under floor
orbitControls.minDistance = 2;
orbitControls.maxDistance = 10;

enterBtn.addEventListener('click', () => {
    configPanel.style.display = 'block'; // ensure it's in DOM
    pointerControls.lock();
});

pointerControls.addEventListener('lock', () => {
    entryOverlay.style.display = 'none';
    if (!isConfiguring) {
        crosshair.style.display = 'block';
        hud.style.display = 'flex';
    }
});
pointerControls.addEventListener('unlock', () => {
    if (!isConfiguring) {
        entryOverlay.style.display = 'flex';
        crosshair.style.display = 'none';
        hud.style.display = 'none';
    }
});

const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false };
document.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

// --------------------------------------------------------
// COLLISION & PHYSICS
// --------------------------------------------------------
const collidableBoxes = [];
const playerBox = new THREE.Box3();
function checkCollision(newPos) {
    playerBox.setFromCenterAndSize(newPos, new THREE.Vector3(0.6, 1.7, 0.6));
    for (const box of collidableBoxes) {
        if (playerBox.intersectsBox(box)) return true;
    }
    return false;
}

// --------------------------------------------------------
// SHOWROOM ENVIRONMENT
// --------------------------------------------------------
const floorMat = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.05, metalness: 0.8 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Walls
const wallMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.8 });
const wallGeo = new THREE.BoxGeometry(60, 15, 1);
const walls = [
    { p: [0, 7.5, -30], r: [0, 0, 0] },
    { p: [0, 7.5, 30], r: [0, 0, 0] },
    { p: [-30, 7.5, 0], r: [0, Math.PI/2, 0] },
    { p: [30, 7.5, 0], r: [0, Math.PI/2, 0] }
];
walls.forEach(w => {
    const mesh = new THREE.Mesh(wallGeo, wallMat);
    mesh.position.set(...w.p);
    mesh.rotation.set(...w.r);
    scene.add(mesh);
    collidableBoxes.push(new THREE.Box3().setFromObject(mesh));
});

// Ambient and Studio Lights
scene.add(new THREE.AmbientLight('#ffffff', 0.2));
const ceilingLight = new THREE.RectAreaLight('#ffffff', 5.0, 30, 30);
ceilingLight.position.set(0, 14, 0);
ceilingLight.lookAt(0, 0, 0);
scene.add(ceilingLight);

// Signage
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('DayEleven', { font, size: 1.5, depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.02, bevelSegments: 3 });
    textGeo.computeBoundingBox();
    const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
    const textMesh = new THREE.Mesh(textGeo, new THREE.MeshStandardMaterial({ color: '#fff', metalness: 0.8 }));
    textMesh.position.set(centerOffset, 8, -29);
    scene.add(textMesh);
});

// --------------------------------------------------------
// CAR MODELS
// --------------------------------------------------------
const cars = [];
const gltfLoader = new GLTFLoader(loadingManager);

function loadVehicle(file, x, z, name, specs, defaultColor, maxScale) {
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.2, 0.2, 64), new THREE.MeshStandardMaterial({ color: '#151515' }));
    platform.position.set(x, 0.1, z);
    platform.receiveShadow = true;
    scene.add(platform);
    
    // Collision box for car (allows walking on platform)
    const cBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2, 5.2));
    cBox.position.set(x, 1, z);
    collidableBoxes.push(new THREE.Box3().setFromObject(cBox));

    const spot = new THREE.SpotLight('#fff', 80, 20, Math.PI/5, 0.5, 1.5);
    spot.position.set(x, 10, z);
    spot.target = platform;
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);

    // Hitbox for interaction
    const hitBox = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.position.set(x, 1, z);
    scene.add(hitBox);

    const vehicleData = { group: new THREE.Group(), hitBox, paintMats: [], name, specs, spot, originalPos: {x, z} };
    vehicleData.group.position.set(x, 0.2, z);
    scene.add(vehicleData.group);
    cars.push(vehicleData);

    gltfLoader.load(`./${file}`, (gltf) => {
        const model = gltf.scene;
        
        // Auto-scale model to fit reasonably
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxScale / maxDim;
        model.scale.set(scale, scale, scale);
        
        // Center model
        box.setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += (size.y * scale) / 2; // rest on platform

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material && !child.material.transparent) {
                    const matName = child.material.name ? child.material.name.toLowerCase() : '';
                    const meshName = child.name ? child.name.toLowerCase() : '';
                    const name = matName + meshName;
                    
                    // Exclude parts that shouldn't be painted based on common naming conventions
                    const isExcluded = name.includes('glass') || name.includes('window') || 
                                       name.includes('tire') || name.includes('rubber') || 
                                       name.includes('wheel') || name.includes('rim') ||
                                       name.includes('light') || name.includes('lamp') ||
                                       name.includes('grill') || name.includes('interior') ||
                                       name.includes('seat') || name.includes('black') || 
                                       name.includes('dark');

                    if (!isExcluded) {
                        const newMat = new THREE.MeshPhysicalMaterial({
                            color: defaultColor, metalness: 0.5, roughness: 0.1, clearcoat: 1.0
                        });
                        child.material = newMat;
                        if (!vehicleData.paintMats.includes(newMat)) {
                            vehicleData.paintMats.push(newMat);
                        }
                    }
                }
            }
        });

        // Failsafe: if the naming convention missed everything, color the absolute largest mesh
        if (vehicleData.paintMats.length === 0) {
            let biggestMesh = null;
            let maxVol = 0;
            model.traverse(c => {
                if (c.isMesh && c.geometry) {
                    c.geometry.computeBoundingBox();
                    if (c.geometry.boundingBox) {
                        const size = c.geometry.boundingBox.getSize(new THREE.Vector3());
                        const vol = size.x * size.y * size.z;
                        if (vol > maxVol) { maxVol = vol; biggestMesh = c; }
                    }
                }
            });
            if (biggestMesh) {
                const newMat = new THREE.MeshPhysicalMaterial({ color: defaultColor, metalness: 0.5, roughness: 0.1, clearcoat: 1.0 });
                biggestMesh.material = newMat;
                vehicleData.paintMats.push(newMat);
            }
        }

        vehicleData.group.add(model);
    });
}

loadVehicle('2015 Dodge Challenger by Grzybek - 1jB8I4t5w4.glb', -10, -5, 'Dodge Challenger', 'V8 Muscle | 707 HP', '#a30000', 4.5);
loadVehicle('Motorcycle by Poly by Google - dse64pqMKAR.glb', 0, -12, 'Poly Motorcycle', 'Electric | 0-60 in 3.1s', '#d4af37', 2.8);
loadVehicle('CAR Model by Ignition Labs - 5zUWP5UsLg-.glb', 10, -5, 'Ignition Concept', 'V12 Hypercar | 1100 HP', '#002244', 4.8);

// --------------------------------------------------------
// INTERACTION & CONFIGURATOR
// --------------------------------------------------------
const raycaster = new THREE.Raycaster();
const centerVector = new THREE.Vector2(0, 0);
let hoveredCar = null;

document.addEventListener('mousedown', (e) => {
    // Ignore clicks on UI
    if (e.target.closest('#config-panel') || e.target.closest('#entry-overlay')) return;

    if (pointerControls.isLocked && hoveredCar && !isConfiguring) {
        enterConfigurator(hoveredCar);
    }
});

function enterConfigurator(carData) {
    isConfiguring = true;
    selectedCar = carData;
    pointerControls.unlock();
    
    // Save position to return to later
    preConfigCameraPos.copy(camera.position);
    preConfigCameraQuat.copy(camera.quaternion);

    crosshair.style.display = 'none';
    hud.style.display = 'none';
    configTitle.innerText = carData.name;
    configSpecs.innerText = carData.specs;

    // Tween camera to car
    const targetX = carData.originalPos.x - 4;
    const targetZ = carData.originalPos.z + 4;
    
    gsap.to(camera.position, { x: targetX, y: 1.8, z: targetZ, duration: 1.5, ease: 'power2.inOut' });
    
    const targetLook = new THREE.Vector3(carData.originalPos.x, 0.75, carData.originalPos.z);
    const dummyCam = camera.clone();
    dummyCam.position.set(targetX, 1.8, targetZ);
    dummyCam.lookAt(targetLook);
    
    gsap.to(camera.quaternion, {
        x: dummyCam.quaternion.x, y: dummyCam.quaternion.y, z: dummyCam.quaternion.z, w: dummyCam.quaternion.w,
        duration: 1.5, ease: 'power2.inOut',
        onComplete: () => { 
            configPanel.classList.add('open'); 
            orbitControls.target.copy(targetLook);
            orbitControls.enabled = true; // Enable orbit around the car!
        }
    });

    gsap.to(carData.spot, { intensity: 150, duration: 1 });
}

exitConfigBtn.addEventListener('click', () => {
    configPanel.classList.remove('open');
    orbitControls.enabled = false; // Disable orbit

    if (selectedCar) gsap.to(selectedCar.spot, { intensity: 80, duration: 1 });
    
    gsap.to(camera.position, { x: preConfigCameraPos.x, y: preConfigCameraPos.y, z: preConfigCameraPos.z, duration: 1.2, ease: 'power2.inOut' });
    gsap.to(camera.quaternion, {
        x: preConfigCameraQuat.x, y: preConfigCameraQuat.y, z: preConfigCameraQuat.z, w: preConfigCameraQuat.w,
        duration: 1.2, ease: 'power2.inOut',
        onComplete: () => {
            selectedCar = null;
            isConfiguring = false;
            pointerControls.lock(); // Go back to walking
        }
    });
});

// Config Panel UI
document.querySelectorAll('#paint-colors .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        document.querySelectorAll('#paint-colors .color-swatch').forEach(s => s.classList.remove('active'));
        e.target.classList.add('active');
        if (selectedCar) {
            const color = e.target.getAttribute('data-color');
            selectedCar.paintMats.forEach(mat => {
                gsap.to(mat.color, { r: new THREE.Color(color).r, g: new THREE.Color(color).g, b: new THREE.Color(color).b, duration: 0.5 });
            });
        }
    });
});

document.querySelectorAll('#paint-finish button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#paint-finish button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        if (selectedCar) {
            const r = parseFloat(e.target.getAttribute('data-r'));
            const m = parseFloat(e.target.getAttribute('data-m'));
            const c = parseFloat(e.target.getAttribute('data-c'));
            selectedCar.paintMats.forEach(mat => {
                gsap.to(mat, { roughness: r, metalness: m, clearcoat: c, duration: 0.5 });
            });
        }
    });
});

// --------------------------------------------------------
// ANIMATION LOOP
// --------------------------------------------------------
const tick = () => {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    // Orbit controls update for damping
    if (orbitControls.enabled) orbitControls.update();

    // Idle rotation for cars
    cars.forEach((c, idx) => {
        if (c !== selectedCar) {
            c.group.rotation.y = Math.sin(time * 0.0005 + idx) * 0.2;
        }
    });

    if (pointerControls.isLocked && !isConfiguring) {
        // --- Walk Movement ---
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        const fwd = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
        const rgt = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
        direction.set(rgt, 0, fwd).normalize();

        const speed = 40.0;
        if (fwd !== 0) velocity.z -= direction.z * speed * delta;
        if (rgt !== 0) velocity.x -= direction.x * speed * delta;

        const moveX = -velocity.x * delta;
        const moveZ = -velocity.z * delta;

        const nextPosX = camera.position.clone(); nextPosX.x += moveX; nextPosX.y -= 0.85;
        if (!checkCollision(nextPosX)) pointerControls.moveRight(moveX); else velocity.x = 0;

        const nextPosZ = camera.position.clone(); nextPosZ.z += moveZ; nextPosZ.y -= 0.85;
        if (!checkCollision(nextPosZ)) pointerControls.moveForward(moveZ); else velocity.z = 0;

        // --- Raycasting ---
        raycaster.setFromCamera(centerVector, camera);
        const hitBoxes = cars.map(c => c.hitBox);
        const intersects = raycaster.intersectObjects(hitBoxes);

        if (intersects.length > 0) {
            hoveredCar = cars.find(c => c.hitBox === intersects[0].object);
            crosshairDot.classList.add('active');
            exhibitHint.innerText = `Inspect ${hoveredCar.name}`;
            exhibitHint.classList.add('visible');
        } else {
            hoveredCar = null;
            crosshairDot.classList.remove('active');
            exhibitHint.classList.remove('visible');
        }
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

tick();
