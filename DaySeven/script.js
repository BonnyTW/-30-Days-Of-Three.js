import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// --------------------------------------------------------
// 1. Scene Setup
// --------------------------------------------------------
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
// A subtle fog to blend the diorama into the background
scene.fog = new THREE.FogExp2('#041421', 0.03);

// --------------------------------------------------------
// 2. Camera & Resizing
// --------------------------------------------------------
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 6, 15);
scene.add(camera);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --------------------------------------------------------
// 3. Renderer
// --------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --------------------------------------------------------
// 4. OrbitControls
// --------------------------------------------------------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera from going below ground
controls.minDistance = 5;
controls.maxDistance = 25;

// --------------------------------------------------------
// 5. HDR Environment
// --------------------------------------------------------
const rgbeLoader = new RGBELoader();
rgbeLoader.load('/cobblestone_street_night_4k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = environmentMap;
    // scene.background = environmentMap;
    // scene.backgroundBlurriness = 0.3; // Slight blur to keep focus on the house
});

// --------------------------------------------------------
// 6. Textures
// --------------------------------------------------------
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('/color.jpg');
colorTexture.colorSpace = THREE.SRGBColorSpace;
// Since it's a door, we don't want it repeating 3x3, but we still apply filtering properties!
colorTexture.generateMipmaps = false;
colorTexture.minFilter = THREE.NearestFilter;
colorTexture.magFilter = THREE.NearestFilter;

// --------------------------------------------------------
// 7. Diorama House & Environment Setup
// --------------------------------------------------------
const houseGroup = new THREE.Group();
scene.add(houseGroup);

// --- Diorama Base (The Ground) ---
const floor = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.4, 14),
    new THREE.MeshStandardMaterial({
        color: '#1a2c1f',
        roughness: 0.8,
        metalness: 0.1
    })
);
floor.position.y = -0.2; // Move down half its height so top is at y=0
floor.receiveShadow = true;
scene.add(floor);

// --- House Walls ---
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3, 4),
    new THREE.MeshStandardMaterial({
        color: 'rgb(10, 9, 9)', // Solid wall color
        roughness: 0.7
    })
);
walls.position.y = 1.5; // Half of height 3
walls.castShadow = true;
walls.receiveShadow = true;
houseGroup.add(walls);

// --- House Roof ---
// Using ConeGeometry with 4 segments creates a perfect pyramid roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 2, 4),
    new THREE.MeshStandardMaterial({
        color: '#3b2013',
        roughness: 0.9
    })
);
roof.position.y = 3 + 1; // Wall height + half roof height
roof.rotation.y = Math.PI * 0.25; // Rotate 45 degrees to align with walls
roof.castShadow = true;
houseGroup.add(roof);

// --- House Door ---
const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2, 0.1),
    new THREE.MeshStandardMaterial({
        map: colorTexture, // Map the door texture here!
        roughness: 0.8
    })
);
door.position.set(0, 1, 2 + 0.01); // Slightly in front of the wall
houseGroup.add(door);

// Warm light right above the door
const doorLight = new THREE.PointLight('#ff7d46', 5, 8);
doorLight.position.set(0, 2.4, 2.5);
doorLight.castShadow = true;
houseGroup.add(doorLight);

// --- Windows ---
const windowGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
const windowMaterial = new THREE.MeshStandardMaterial({ 
    map: colorTexture, // Use the color texture for the window too!
    emissive: '#ffc872',
    emissiveIntensity: 0.1, // Lower brightness
    roughness: 0.2 // Slightly reflective like glass
});

const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
window1.position.set(1.2, 1.2, 2.01);
houseGroup.add(window1);

const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
window2.position.set(-1.2, 1.2, 2.01);
houseGroup.add(window2);

// --- Chimney ---
const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.5, 0.6),
    new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.8 })
);
chimney.position.set(1, 3.5, -0.5);
chimney.castShadow = true;
houseGroup.add(chimney);

// --- Pathway ---
const pathGeometry = new THREE.BoxGeometry(1, 0.1, 0.7);
const pathMaterial = new THREE.MeshStandardMaterial({ color: '#444444', roughness: 0.8 });

for(let i = 0; i < 6; i++) {
    const stone = new THREE.Mesh(pathGeometry, pathMaterial);
    stone.position.set((Math.random() - 0.5) * 0.2, 0.05, 3 + i * 0.9);
    stone.rotation.y = (Math.random() - 0.5) * 0.3;
    stone.receiveShadow = true;
    houseGroup.add(stone);
}

// --- Spooky Trees ---
const trunkGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
const leavesGeometry = new THREE.ConeGeometry(1.2, 2.5, 4);
const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.9 });
const leavesMaterial = new THREE.MeshStandardMaterial({ color: '#092b10', roughness: 0.9 });

const createTree = (x, z) => {
    const treeGroup = new THREE.Group();
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    
    treeGroup.add(trunk, leaves);
    treeGroup.position.set(x, 0, z);
    
    // Randomize slightly for organic look
    treeGroup.scale.set(
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.4
    );
    treeGroup.rotation.y = Math.random() * Math.PI;
    
    return treeGroup;
};

// Add trees to the yard
houseGroup.add(createTree(4.5, -3));
houseGroup.add(createTree(-4.5, -2));
houseGroup.add(createTree(3.5, 4));
houseGroup.add(createTree(-4.5, 3));

// --- Bushes ---
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#0d3815', roughness: 0.9 });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.6, 0.6, 0.6);
bush1.position.set(1.5, 0.2, 2.2);
bush1.castShadow = true;
bush1.receiveShadow = true;

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.3, 0.3, 0.3);
bush2.position.set(2.2, 0.1, 2.1);
bush2.castShadow = true;
bush2.receiveShadow = true;

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.5, 0.5, 0.5);
bush3.position.set(-1.8, 0.1, 2.2);
bush3.castShadow = true;
bush3.receiveShadow = true;

houseGroup.add(bush1, bush2, bush3);

// --- Scattered Fences / Tombstones ---
const gravesGroup = new THREE.Group();
scene.add(gravesGroup);

const graveGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.8 });

for (let i = 0; i < 25; i++) {
    // Scatter around the house randomly using sine and cosine
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.5 + Math.random() * 2.5; // Place between house and edge of base
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, 0.3, z);

    // Slight random rotation for a chaotic look
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    grave.rotation.z = (Math.random() - 0.5) * 0.1;

    grave.castShadow = true;
    grave.receiveShadow = true;
    gravesGroup.add(grave);
}

// --------------------------------------------------------
// 8. Magical Floating Lights (Ghosts/Fireflies)
// --------------------------------------------------------
const fireflies = [];
const colors = ['#ff00ff', '#00ffff', '#ffff00'];

for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(colors[i], 10, 5);
    light.castShadow = true;

    // Add a glowing core to the light
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: colors[i] })
    );
    light.add(core);
    scene.add(light);

    fireflies.push({
        light: light,
        angle: Math.random() * Math.PI * 2,
        radius: 4 + Math.random() * 2,
        speed: 0.1 + Math.random() * 0.15, // Slowed down significantly!
        yOffset: Math.random() * 2
    });
}

// --------------------------------------------------------
// 9. Scene Lighting
// --------------------------------------------------------
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.02); // Much darker ambient light
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.15); // Much darker moonlight
moonLight.position.set(4, 8, -4);
moonLight.castShadow = true;
// Optimize shadows
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 20;
moonLight.shadow.camera.left = -10;
moonLight.shadow.camera.right = 10;
moonLight.shadow.camera.top = 10;
moonLight.shadow.camera.bottom = -10;
scene.add(moonLight);

// --------------------------------------------------------
// 10. Animation Loop
// --------------------------------------------------------
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Animate Magical Fireflies
    for (let i = 0; i < fireflies.length; i++) {
        const firefly = fireflies[i];

        // Circular orbit
        firefly.angle += firefly.speed * 0.02;
        firefly.light.position.x = Math.cos(firefly.angle) * firefly.radius;
        firefly.light.position.z = Math.sin(firefly.angle) * firefly.radius;

        // Bobbing motion
        firefly.light.position.y = 1 + firefly.yOffset + Math.sin(elapsedTime * firefly.speed * 2) * 1.5;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
