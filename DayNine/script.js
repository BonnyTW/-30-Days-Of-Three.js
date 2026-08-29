import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e2e8f0');
scene.fog = new THREE.Fog('#e2e8f0', 15, 40);

const sizes = { width: window.innerWidth, height: window.innerHeight };

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 5, 20);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;

const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 40;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.5 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const redMaterial = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3, metalness: 0.1 });
const whiteMaterial = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.1 });
const standMaterial = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });

const targets = [];
const interactables = [];

const targetPattern = [
    ['r','r','r','r','r'],
    ['r','w','w','w','r'],
    ['r','w','r','w','r'],
    ['r','w','w','w','r'],
    ['r','r','r','r','r']
];

const createArcadeTarget = (x, z) => {
    const targetGroup = new THREE.Group();
    targetGroup.position.set(x, 0, z);
    
    const standHeight = 3;
    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, standHeight, 0.5),
        standMaterial
    );
    stand.position.y = standHeight / 2;
    stand.castShadow = true;
    stand.receiveShadow = true;
    targetGroup.add(stand);

    const boardGroup = new THREE.Group();
    boardGroup.position.y = standHeight + 1;
    targetGroup.add(boardGroup);

    const size = 0.4;
    const offset = (5 * size) / 2 - (size / 2);

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const type = targetPattern[row][col];
            const mat = type === 'r' ? redMaterial.clone() : whiteMaterial.clone();
            
            const piece = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
            
            piece.position.set(
                col * size - offset,
                -(row * size - offset),
                0
            );
            
            piece.userData = {
                offsetX: piece.position.x,
                offsetY: piece.position.y,
                offsetZ: piece.position.z,
                isPiece: true
            };
            
            piece.castShadow = true;
            piece.receiveShadow = true;
            boardGroup.add(piece);
            interactables.push(piece);
        }
    }
    
    boardGroup.userData = {
        isTarget: true,
        isDestroyed: false,
        initialY: boardGroup.position.y
    };
    
    scene.add(targetGroup);
    targets.push(boardGroup);
};

createArcadeTarget(-6, 0);
createArcadeTarget(0, -3);
createArcadeTarget(6, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0) {
        const hitPiece = intersects[0].object;

        if (hitPiece.userData.isPiece) {
            const boardGroup = hitPiece.parent;
            
            if (!boardGroup.userData.isDestroyed) {
                boardGroup.userData.isDestroyed = true;

                const laserMat = new THREE.LineBasicMaterial({ color: '#ef4444', linewidth: 4 });
                const points = [
                    new THREE.Vector3(0, -1, 3).applyMatrix4(camera.matrixWorld),
                    intersects[0].point
                ];
                
                const laserGeo = new THREE.BufferGeometry().setFromPoints(points);
                const laser = new THREE.Line(laserGeo, laserMat);
                scene.add(laser);

                gsap.to(laserMat, {
                    opacity: 0,
                    transparent: true,
                    duration: 0.15,
                    onComplete: () => {
                        scene.remove(laser);
                        laserGeo.dispose();
                        laserMat.dispose();
                    }
                });

                const pieces = [...boardGroup.children];
                pieces.forEach(piece => {
                    const blastStrength = 5 + Math.random() * 5;
                    
                    let dirX = piece.userData.offsetX * 2;
                    let dirY = piece.userData.offsetY * 2;
                    let dirZ = - (2 + Math.random() * 2); 

                    scene.attach(piece); 

                    gsap.to(piece.position, {
                        x: piece.position.x + dirX * blastStrength,
                        y: Math.max(piece.position.y + dirY * blastStrength, 0.2),
                        z: piece.position.z + dirZ * blastStrength,
                        duration: 1 + Math.random() * 0.5,
                        ease: "power3.out"
                    });

                    gsap.to(piece.rotation, {
                        x: Math.random() * Math.PI * 8,
                        y: Math.random() * Math.PI * 8,
                        z: Math.random() * Math.PI * 8,
                        duration: 1 + Math.random() * 0.5,
                        ease: "power3.out"
                    });

                    gsap.to(piece.scale, {
                        x: 0, y: 0, z: 0,
                        duration: 0.4,
                        delay: 0.6 + Math.random() * 0.4,
                        ease: "power2.in",
                        onComplete: () => {
                            scene.remove(piece);
                            piece.geometry.dispose();
                            piece.material.dispose();
                        }
                    });
                });
            }
        }
    }
});

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0 && !intersects[0].object.parent.userData.isDestroyed) {
        document.body.style.cursor = 'crosshair';
    } else {
        document.body.style.cursor = 'default';
    }
});

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    for (const board of targets) {
        if (!board.userData.isDestroyed) {
            board.position.y = board.userData.initialY + Math.sin(elapsedTime * 2 + board.position.x) * 0.2;
        }
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
