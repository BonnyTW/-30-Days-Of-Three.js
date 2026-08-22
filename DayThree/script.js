import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import './style.css'


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


window.addEventListener('resize', () => {
    sizes.height = window.innerHeight
    sizes.width = window.innerWidth

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


})



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5

const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2, 2, 2, 2), new THREE.MeshBasicMaterial({ color: '#ff0000', wireframe: true }))
scene.add(cube)


// ============ DEBUG UI ============
const gui = new GUI({ width: 340, title: '🎛️ Cube Debug Panel' })

// --- Parameters object for custom controls ---
const parameters = {
    color: '#ff0000',
    spin: () => {
        gsap.to(cube.rotation, { y: cube.rotation.y + Math.PI * 2, duration: 1.5, ease: 'power2.inOut' })
    },
    backgroundColor: '#000000'
}

// --- Position Folder ---
const positionFolder = gui.addFolder('Position')
positionFolder.add(cube.position, 'x').min(-5).max(5).step(0.01).name('X')
positionFolder.add(cube.position, 'y').min(-5).max(5).step(0.01).name('Y')
positionFolder.add(cube.position, 'z').min(-5).max(5).step(0.01).name('Z')

// --- Rotation Folder ---
const rotationFolder = gui.addFolder('Rotation')
rotationFolder.add(cube.rotation, 'x').min(0).max(Math.PI * 2).step(0.01).name('X')
rotationFolder.add(cube.rotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('Y')
rotationFolder.add(cube.rotation, 'z').min(0).max(Math.PI * 2).step(0.01).name('Z')

// --- Scale Folder ---
const scaleFolder = gui.addFolder('Scale')
scaleFolder.add(cube.scale, 'x').min(0.1).max(5).step(0.01).name('X')
scaleFolder.add(cube.scale, 'y').min(0.1).max(5).step(0.01).name('Y')
scaleFolder.add(cube.scale, 'z').min(0.1).max(5).step(0.01).name('Z')

// --- Material Folder ---
const materialFolder = gui.addFolder('Material')
materialFolder.addColor(parameters, 'color').name('Color').onChange((value) => {
    cube.material.color.set(value)
})
materialFolder.add(cube.material, 'wireframe').name('Wireframe')
materialFolder.add(cube, 'visible').name('Visible')

// --- Actions Folder ---
const actionsFolder = gui.addFolder('Actions')
actionsFolder.add(parameters, 'spin').name('🔄 Spin Animation')
actionsFolder.addColor(parameters, 'backgroundColor').name('BG Color').onChange((value) => {
    scene.background = new THREE.Color(value)
})
// ==================================



// --- Custom BufferGeometry 
// const geometry = new THREE.BufferGeometry()

// const count = 50 // Number of triangles
// const positionsArray = new Float32Array(count * 3 * 3) // 3 corners per triangle, 3 coordinates (x,y,z) per corner

// for (let i = 0; i < count * 3 * 3; i++) {
//     positionsArray[i] = (Math.random() - 0.5) * 4
// }

// const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3)
// geometry.setAttribute('position', positionsAttribute)
// const material = new THREE.MeshBasicMaterial({ color: 'green', wireframe: true })
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)



const canvas = document.querySelector('.webgl')


// ORBIT CONTROL
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true

//orbitControls.dampingFactor = 0.05



const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const tick = () => {

    orbitControls.update()



    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

