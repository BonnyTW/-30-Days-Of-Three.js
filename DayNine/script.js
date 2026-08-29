import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import gsap from 'gsap';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#050510');
scene.fog = new THREE.Fog('#050510', 15, 60);

// UI Elements
const scoreElement = document.getElementById('score-value');
let score = 0;

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight };

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 2, 35);
scene.add(camera);

// Controls (Day 7)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 50;
controls.minDistance = 10;

// Materials
const textMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.8,
});

const shapeMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1f35',
    roughness: 0.2,
    metalness: 0.9,
});

// Fonts (Day 6)
const fontLoader = new FontLoader();
let textMesh;

fontLoader.load(
    'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry('THREE.JS', {
            font: font,
            size: 3.5,
            depth: 0.8,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.04,
            bevelOffset: 0,
            bevelSegments: 5
        });
        textGeometry.center();
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.castShadow = true;
        scene.add(textMesh);
    }
);

// Floating Interactive Shapes (Day 8 combination)
const shapes = [];
const interactables = [];
const geometry = new THREE.IcosahedronGeometry(0.8, 0);

for (let i = 0; i < 100; i++) {
    // .clone() so each shape can change color independently!
    const mesh = new THREE.Mesh(geometry, shapeMaterial.clone());
    
    // Random position in a spherical area around the text
    const radius = 8 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
    mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
    mesh.position.z = radius * Math.cos(phi);
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    const scale = Math.random() * 1.2 + 0.3;
    mesh.scale.set(scale, scale, scale);
    mesh.castShadow = true;

    // userData for game logic! (Day 8)
    mesh.userData = {
        isInteractable: true,
        isDestroyed: false,
        baseScale: scale,
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: Math.random() * 0.02,
        initialY: mesh.position.y
    };

    scene.add(mesh);
    shapes.push(mesh);
    interactables.push(mesh); // Add to the array the raycaster will check
}

// Lights (Day 7)
const ambientLight = new THREE.AmbientLight('#ffffff', 0.1);
scene.add(ambientLight);

// Cinematic Point Lights for that neon glow
const pinkLight = new THREE.PointLight('#ff3366', 8, 40);
pinkLight.position.set(-8, 3, 5);
scene.add(pinkLight);

const blueLight = new THREE.PointLight('#33ccff', 8, 40);
blueLight.position.set(8, -3, 5);
scene.add(blueLight);

const whiteLight = new THREE.DirectionalLight('#ffffff', 1);
whiteLight.position.set(0, 10, 10);
scene.add(whiteLight);

// Raycaster (Day 8)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

// Explosion Effect Generator
const createExplosion = (position, color) => {
    const particleCount = 20;
    const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: color });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        scene.add(particle);

        const angle = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = Math.random() * 4 + 2;
        
        const targetX = position.x + speed * Math.sin(phi) * Math.cos(angle);
        const targetY = position.y + speed * Math.sin(phi) * Math.sin(angle);
        const targetZ = position.z + speed * Math.cos(phi);

        gsap.to(particle.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power2.out"
        });

        gsap.to(particle.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5 + Math.random() * 0.5,
            ease: "power2.out",
            onComplete: () => {
                scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            }
        });
    }
};

// Interaction Logic: Click to destroy
window.addEventListener('mousedown', (event) => {
    // Convert mouse click position to Three.js coordinates (-1 to +1 range)
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    // Aim the laser from the camera to the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check what we hit!
    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;

        // Draw Laser Beam!
        const material = new THREE.LineBasicMaterial({ color: '#33ccff', linewidth: 3 });
        const points = [];
        
        // Offset the start point so it looks like it comes from slightly below the camera
        const startPoint = new THREE.Vector3(0, -1, -2);
        startPoint.applyMatrix4(camera.matrixWorld);
        
        points.push(startPoint);
        points.push(intersects[0].point);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);

        gsap.to(material, {
            opacity: 0,
            transparent: true,
            duration: 0.2,
            onComplete: () => {
                scene.remove(line);
                geometry.dispose();
                material.dispose();
            }
        });

        if (hitObject.userData.isInteractable && !hitObject.userData.isDestroyed) {
            hitObject.userData.isDestroyed = true; // Mark as dead
            
            // Score update
            score++;
            scoreElement.innerText = score;

            // Trigger Particle Explosion
            createExplosion(hitObject.position, '#ff3366');

            // Visual feedback: instantly turn neon pink
            hitObject.material.color.set('#ff3366');
            hitObject.material.emissive = new THREE.Color('#ff3366');
            hitObject.material.emissiveIntensity = 2;

            // GSAP Animation: Explode and disappear
            gsap.to(hitObject.scale, {
                x: hitObject.userData.baseScale * 2.5,
                y: hitObject.userData.baseScale * 2.5,
                z: hitObject.userData.baseScale * 2.5,
                duration: 0.15,
                ease: "power2.out"
            });
            
            gsap.to(hitObject.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.4,
                delay: 0.15,
                ease: "back.in(2)",
                onComplete: () => {
                    scene.remove(hitObject); // Clean up memory!
                    hitObject.geometry.dispose();
                    hitObject.material.dispose();
                }
            });
        }
    }
});

// Cursor Hover Effect (Change cursor to crosshair if hovering over a shape)
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactables, false);

    if (intersects.length > 0 && !intersects[0].object.userData.isDestroyed) {
        document.body.style.cursor = 'crosshair';
        const object = intersects[0].object;
        
        if (hoveredObject !== object) {
            // Restore previous object if it wasn't destroyed
            if (hoveredObject && !hoveredObject.userData.isDestroyed) {
                gsap.to(hoveredObject.scale, {
                    x: hoveredObject.userData.baseScale,
                    y: hoveredObject.userData.baseScale,
                    z: hoveredObject.userData.baseScale,
                    duration: 0.3
                });
                hoveredObject.material.emissiveIntensity = 0;
            }
            
            hoveredObject = object;
            
            // Scale up newly hovered object
            gsap.to(hoveredObject.scale, {
                x: hoveredObject.userData.baseScale * 1.4,
                y: hoveredObject.userData.baseScale * 1.4,
                z: hoveredObject.userData.baseScale * 1.4,
                duration: 0.3,
                ease: "back.out(1.5)"
            });
            hoveredObject.material.emissive = new THREE.Color('#33ccff');
            hoveredObject.material.emissiveIntensity = 0.5;
        }
    } else {
        document.body.style.cursor = 'default';
        if (hoveredObject && !hoveredObject.userData.isDestroyed) {
            gsap.to(hoveredObject.scale, {
                x: hoveredObject.userData.baseScale,
                y: hoveredObject.userData.baseScale,
                z: hoveredObject.userData.baseScale,
                duration: 0.3
            });
            hoveredObject.material.emissiveIntensity = 0;
            hoveredObject = null;
        }
    }
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate shapes and add floating effect
    for (const mesh of shapes) {
        if (!mesh.userData.isDestroyed) {
            mesh.rotation.x += mesh.userData.speedX;
            mesh.rotation.y += mesh.userData.speedY;
            mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime * 2 + mesh.position.x) * mesh.userData.floatSpeed * 15;
        }
    }

    // Gentle float for the center text
    if (textMesh) {
        textMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.4;
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
