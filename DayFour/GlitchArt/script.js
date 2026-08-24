import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
})

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load('../color.jpg')

// The Glitchy Animated Texture
const glitchTexture = colorTexture.clone()
glitchTexture.wrapS = THREE.RepeatWrapping
glitchTexture.wrapT = THREE.RepeatWrapping
glitchTexture.center.set(0.5, 0.5) // Set rotation center to the middle
glitchTexture.generateMipmaps = false
glitchTexture.minFilter = THREE.NearestFilter
glitchTexture.magFilter = THREE.NearestFilter

const scene = new THREE.Scene()
scene.fog = new THREE.Fog('#050505', 1, 15) // Add some fog for depth!

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 4

const canvas = document.querySelector('.webgl')

const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true

// --- 3D OBJECTS ---

// A Group to hold our floating cubes
const floatingGroup = new THREE.Group()
scene.add(floatingGroup)

// Make it a "perfect" singular centerpiece box, slightly larger
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
const cubeMaterial = new THREE.MeshBasicMaterial({ map: glitchTexture })

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
cube.position.set(0, 0, 0)
floatingGroup.add(cube)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#050505') // Match fog color

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Animate the Glitch Texture!
    glitchTexture.offset.x = elapsedTime * 0.5
    // glitchTexture.offset.y = Math.sin(elapsedTime * 2) * 0.2
    // glitchTexture.rotation = Math.cos(elapsedTime) * 0.5

    // Slowly rotate the whole cluster of cubes
    floatingGroup.rotation.y = elapsedTime * 0.2
    floatingGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2

    orbitControls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
