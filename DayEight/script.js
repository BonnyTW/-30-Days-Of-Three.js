import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import gsap from 'gsap';
import GUI from 'lil-gui';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1a2e');
scene.fog = new THREE.Fog('#1a1a2e', 1, 40);

const scoreElement = document.getElementById('score-value');
const resetButton = document.getElementById('reset-button');
let score = 0;

const gui = new GUI({ title: 'Shooting Range Debug' });
const debugObject = {
    targetSpeedMult: 1,
    fallDuration: 0.4
};
gui.add(debugObject, 'targetSpeedMult').min(0).max(3).step(0.1).name('Target Speed');
gui.add(debugObject, 'fallDuration').min(0.1).max(2).step(0.1).name('Fall Speed');

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 3, 10);
scene.add(camera);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // enable shadow 
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// camera controller, hides cursor,links your mouse movements directly to the camera
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', (event) => {
    if (event.target.id === 'reset-button' || event.target.closest('.lil-gui')) return;
    controls.lock();
});

const ambientLight = new THREE.AmbientLight('#ffffff', 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight('#ff6666', 20, 40, Math.PI / 5, 0.8, 1);
spotLight.position.set(0, 8, 8);
spotLight.target.position.set(0, 0, -5);
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

const environmentGroup = new THREE.Group();
scene.add(environmentGroup);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: '#2a2a35', roughness: 0.8, metalness: 0.2 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
environmentGroup.add(ground);

const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(40, 15, 1),
    new THREE.MeshStandardMaterial({ color: '#11111a', roughness: 0.9 })
);
backWall.position.set(0, 7.5, -12);
backWall.receiveShadow = true;
environmentGroup.add(backWall);



const targets = [];
const targetGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 32);
targetGeometry.rotateX(-Math.PI / 2);
const targetMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });

const targetPositions = [
    { x: -5, y: 1.5, z: -5, speed: 0.5, sizeMult: 1 },
    { x: -2, y: 3.5, z: -7, speed: 0.8, sizeMult: 0.7 },
    { x: 0, y: 2, z: -4, speed: -0.6, sizeMult: 1.2 },
    { x: 3, y: 4, z: -8, speed: 1.2, sizeMult: 0.6 },
    { x: 5, y: 1.5, z: -5, speed: -0.7, sizeMult: 1 },
    { x: -7, y: 2.5, z: -9, speed: 1.5, sizeMult: 0.5 },
    { x: -4, y: 4.5, z: -10, speed: -0.9, sizeMult: 0.8 },
    { x: 6, y: 3, z: -6, speed: 1.1, sizeMult: 0.9 },
];

targetPositions.forEach((pos) => {
    const targetGroup = new THREE.Group();
    targetGroup.position.set(pos.x, pos.y, pos.z);

    const mesh = new THREE.Mesh(targetGeometry, targetMaterial.clone()); // .clone() used to make independent copy of material
    mesh.scale.set(pos.sizeMult, pos.sizeMult, pos.sizeMult);
    mesh.castShadow = true;

    const innerRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.16, 32).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: '#ff3366' })
    );
    const centerDot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.17, 16).rotateX(Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );

    mesh.add(innerRing, centerDot);
    targetGroup.add(mesh);

    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, pos.y, 0.2),
        new THREE.MeshStandardMaterial({ color: '#444' })
    );
    stand.position.y = -pos.y / 2;
    stand.castShadow = true;
    targetGroup.add(stand);

    scene.add(targetGroup);

    //UserData: An empty object built into Three.js for developers to attach custom game variables (score, state, etc.)
    mesh.userData = {
        isTarget: true, // I am a shootable target 
        isHit: false,
        initialRotX: mesh.rotation.x, //Remember my starting rotation. (important for  Reset button)
        speed: pos.speed,
        baseX: pos.x,
        sizeMult: pos.sizeMult,
        points: Math.round(10 / pos.sizeMult)
    };

    targets.push(mesh);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousedown', (event) => {
    if (event.target.id === 'reset-button' || event.target.closest('.lil-gui')) return;

    if (!controls.isLocked) return;

    mouse.x = 0;
    mouse.y = 0;

    raycaster.setFromCamera(mouse, camera); // fires laser straight to center of screen from camera

    const allIntersectables = [...targets, ...environmentGroup.children]; //Gathers a list of absolutely everything in the game that a bullet could physically hit 
    const intersects = raycaster.intersectObjects(allIntersectables, false);

    let destination = new THREE.Vector3();
    let hitObject = null;

    if (intersects.length > 0) {
        destination.copy(intersects[0].point);
        hitObject = intersects[0].object;
    } else {
        raycaster.ray.at(50, destination);
    }

    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#ffffaa' })
    );
    bullet.position.copy(camera.position);

    const offset = new THREE.Vector3(0.3, -0.3, -0.5);
    offset.applyQuaternion(camera.quaternion);
    bullet.position.add(offset);

    scene.add(bullet);

    const distance = bullet.position.distanceTo(destination);
    const bulletSpeed = 100;
    const duration = distance / bulletSpeed;

    gsap.to(bullet.position, {
        x: destination.x,
        y: destination.y,
        z: destination.z,
        duration: duration,
        ease: "none",
        onComplete: () => {
            scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();

            if (hitObject && hitObject.userData.isTarget && !hitObject.userData.isHit) {
                hitObject.userData.isHit = true;

                score += hitObject.userData.points;
                scoreElement.innerText = score;

                hitObject.material.color.set('#555555');
                hitObject.children[0].material.color.set('#333333');
                hitObject.children[1].material.color.set('#222222');

                gsap.to(hitObject.rotation, {
                    x: hitObject.rotation.x - Math.PI / 2,
                    duration: debugObject.fallDuration,
                    ease: "power2.in"
                });

                gsap.to(hitObject.position, {
                    y: hitObject.position.y - 0.5,
                    z: hitObject.position.z - 0.5,
                    duration: debugObject.fallDuration,
                    ease: "bounce.out",
                    delay: debugObject.fallDuration * 0.5
                });
            }
        }
    });
});


const resetRange = () => {
    score = 0;
    scoreElement.innerText = score;

    targets.forEach((target) => {
        target.userData.isHit = false;

        target.material.color.set('#ffffff');
        target.children[0].material.color.set('#ff3366');
        target.children[1].material.color.set('#ffffff');

        gsap.to(target.rotation, {
            x: target.userData.initialRotX,
            duration: 0.5,
            ease: "back.out(1.5)"
        });

        gsap.to(target.position, {
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    });
};

resetButton.addEventListener('click', resetRange);

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r') {
        resetRange();
    }
});

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    targets.forEach((target) => {
        if (!target.userData.isHit) {
            const group = target.parent;
            group.position.x = target.userData.baseX + Math.sin(elapsedTime * target.userData.speed * debugObject.targetSpeedMult) * 2;
        }
    });

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
