import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#050510');

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 4, 8);
camera.setViewOffset(sizes.width, sizes.height, -sizes.width * 0.25, 0, sizes.width, sizes.height);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0); 

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight('#ffffff', 1.0);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight('#ffffff', 2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight('#4488ff', 1.5);
dirLight2.position.set(-5, 5, -5);
scene.add(dirLight2);

const boxGroup = new THREE.Group();
scene.add(boxGroup);

const gridSize = 5;
const cubeSize = 0.4;
const gap = 0.05;
const pieces = [];
const originalData = [];

const rubikColors = {
    right: '#cc0000',
    left: '#ff6600',
    top: '#ffffff',
    bottom: '#ffd500',
    front: '#009900',
    back: '#0000cc',
    interior: '#111111'
};

const offset = (gridSize - 1) * (cubeSize + gap) / 2;

for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            
            const mats = [
                new THREE.MeshStandardMaterial({ color: x === (gridSize - 1) ? rubikColors.right : rubikColors.interior, roughness: 0.2 }),
                new THREE.MeshStandardMaterial({ color: x === 0 ? rubikColors.left : rubikColors.interior, roughness: 0.2 }),
                new THREE.MeshStandardMaterial({ color: y === (gridSize - 1) ? rubikColors.top : rubikColors.interior, roughness: 0.2 }),
                new THREE.MeshStandardMaterial({ color: y === 0 ? rubikColors.bottom : rubikColors.interior, roughness: 0.2 }),
                new THREE.MeshStandardMaterial({ color: z === (gridSize - 1) ? rubikColors.front : rubikColors.interior, roughness: 0.2 }),
                new THREE.MeshStandardMaterial({ color: z === 0 ? rubikColors.back : rubikColors.interior, roughness: 0.2 })
            ];
            
            const mesh = new THREE.Mesh(geo, mats);
            
            const px = x * (cubeSize + gap) - offset;
            const py = y * (cubeSize + gap) - offset;
            const pz = z * (cubeSize + gap) - offset;
            
            mesh.position.set(px, py, pz);
            
            mesh.userData.originalColors = mats.map(m => m.color.getHex());
            
            boxGroup.add(mesh);
            pieces.push(mesh);
            
            originalData.push({
                px, py, pz,
                rx: mesh.rotation.x,
                ry: mesh.rotation.y,
                rz: mesh.rotation.z
            });
        }
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-2, -2);
let isExploded = false;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

let isDragging = false;
window.addEventListener('mousedown', () => { isDragging = false; });
window.addEventListener('mousemove', () => { isDragging = true; });

window.addEventListener('mouseup', () => {
    if (isDragging || isExploded) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pieces);
    
    if (intersects.length > 0) {
        explodeBox();
    }
});

function explodeBox() {
    isExploded = true;
    
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        
        const dir = piece.position.clone().normalize();
        
        dir.x += (Math.random() - 0.5) * 0.5;
        dir.y += (Math.random() - 0.5) * 0.5;
        dir.z += (Math.random() - 0.5) * 0.5;
        dir.normalize();
        
        const distance = 3 + Math.random() * 5;
        
        gsap.to(piece.position, {
            x: piece.position.x + dir.x * distance,
            y: piece.position.y + dir.y * distance + (Math.random() * 3),
            z: piece.position.z + dir.z * distance,
            duration: 1 + Math.random(),
            ease: 'expo.out'
        });
        
        gsap.to(piece.rotation, {
            x: Math.random() * Math.PI * 8,
            y: Math.random() * Math.PI * 8,
            z: Math.random() * Math.PI * 8,
            duration: 1 + Math.random(),
            ease: 'expo.out'
        });
    }
    
    gsap.delayedCall(2, reconstructBox);
}

function reconstructBox() {
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        const orig = originalData[i];
        
        gsap.to(piece.position, {
            x: orig.px,
            y: orig.py,
            z: orig.pz,
            duration: 1.5,
            ease: 'power3.inOut'
        });
        
        gsap.to(piece.rotation, {
            x: orig.rx,
            y: orig.ry,
            z: orig.rz,
            duration: 1.5,
            ease: 'power3.inOut'
        });
    }
    
    gsap.delayedCall(1.5, () => {
        isExploded = false;
    });
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.setViewOffset(sizes.width, sizes.height, -sizes.width * 0.25, 0, sizes.width, sizes.height);
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    
    controls.update();
    
    if (!isExploded) {
        boxGroup.rotation.y = Math.sin(elapsedTime * 0.2) * 0.5;
        boxGroup.rotation.x = Math.cos(elapsedTime * 0.15) * 0.3;
        boxGroup.rotation.z = Math.sin(elapsedTime * 0.1) * 0.2;
    }
    
    if (!isExploded) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pieces);
        
        for (const piece of pieces) {
            for (let i = 0; i < 6; i++) {
                piece.material[i].color.lerp(new THREE.Color(piece.userData.originalColors[i]), 0.1);
            }
        }
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            
            const piece = intersects[0].object;
            for (let i = 0; i < 6; i++) {
                piece.material[i].color.set('#000000');
            }
        } else {
            document.body.style.cursor = 'grab';
        }
    } else {
        document.body.style.cursor = 'default';
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
