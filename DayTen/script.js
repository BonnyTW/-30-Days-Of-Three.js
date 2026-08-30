import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#222222');
scene.fog = new THREE.Fog('#222222', 10, 50);

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.y = 1.6;
scene.add(camera);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight('#ffffff', 1.0);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.1 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const gridHelper = new THREE.GridHelper(100, 100, '#111111', '#444444');
gridHelper.position.y = 0.01;
scene.add(gridHelper);

const obstacleBoxes = [];
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshStandardMaterial({ color: '#4b88ff', roughness: 0.4 });

const rows = 3;
const cols = 8;
const spacingX = 6;
const spacingZ = 12;

for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const box = new THREE.Mesh(boxGeometry, boxMaterial);

        box.position.x = (c - (cols - 1) / 2) * spacingX;
        box.position.y = 1;
        box.position.z = (r - (rows - 1) / 2) * spacingZ - 10;

        box.castShadow = true;
        scene.add(box);

        box.updateMatrixWorld();
        const boundingBox = new THREE.Box3().setFromObject(box);
        boundingBox.expandByScalar(0.1);
        obstacleBoxes.push(boundingBox);
    }
}

const controls = new PointerLockControls(camera, document.body);

const blocker = document.createElement('div');
blocker.style.position = 'absolute';
blocker.style.top = '50%';
blocker.style.left = '50%';
blocker.style.transform = 'translate(-50%, -50%)';
blocker.style.zIndex = '100';
blocker.style.color = '#333';
blocker.style.fontFamily = 'Arial, sans-serif';
blocker.style.textAlign = 'center';
blocker.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
blocker.style.padding = '30px';
blocker.style.borderRadius = '10px';
blocker.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
blocker.style.cursor = 'pointer';
blocker.innerHTML = `
    <p style="font-size: 1.1rem; color: #555; line-height: 1.6;">
        <b>W A S D</b> to move <br> 
        <b>Mouse</b> to look <br> 
        <b>ESC</b> to exit
    </p>
`;
document.body.appendChild(blocker);

blocker.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => blocker.style.display = 'none');
controls.addEventListener('unlock', () => blocker.style.display = 'block');

const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false };
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false;
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;

const tick = () => {
    const delta = clock.getDelta();

    if (controls.isLocked) {
        velocity.x -= velocity.x * 8.0 * delta;
        velocity.z -= velocity.z * 8.0 * delta;

        const fwd = Number(keys.w || keys.arrowup) - Number(keys.s || keys.arrowdown);
        const rgt = Number(keys.d || keys.arrowright) - Number(keys.a || keys.arrowleft);

        direction.set(rgt, 0, fwd);
        direction.normalize();

        const speed = 40.0;
        if (keys.w || keys.s || keys.arrowup || keys.arrowdown) velocity.z -= direction.z * speed * delta;
        if (keys.a || keys.d || keys.arrowleft || keys.arrowright) velocity.x -= direction.x * speed * delta;

        const oldX = camera.position.x;
        const oldZ = camera.position.z;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        const playerBox = new THREE.Box3();
        playerBox.setFromCenterAndSize(camera.position, new THREE.Vector3(0.6, 1.6, 0.6));

        for (let i = 0; i < obstacleBoxes.length; i++) {
            if (playerBox.intersectsBox(obstacleBoxes[i])) {
                camera.position.x = oldX;
                camera.position.z = oldZ;
                velocity.x = 0;
                velocity.z = 0;
                break;
            }
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
