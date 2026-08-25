import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui';

const gui = new GUI()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


const textureLoader = new THREE.TextureLoader()
const door = textureLoader.load('pictures/color.jpg')
// door.colorSpace = THREE.SRGBColorSpace

const texture1 = textureLoader.load('1.png')
const texture2 = textureLoader.load('2.png')
const texture3 = textureLoader.load('3.png')
const texture4 = textureLoader.load('4.png')
const texture5 = textureLoader.load('5.png')
const texture6 = textureLoader.load('6.png')
const texture7 = textureLoader.load('7.png')
const texture8 = textureLoader.load('8.png')


// 1. CubeTextureLoader(It creates a "box" around the scene)
// We use this when we have 6 separate image files (px, nx, py, ny, pz, nz).
// we have to set scene.background and scene.environment

const cubeTextureLoader = new THREE.CubeTextureLoader()
const enviromentMapTexture = cubeTextureLoader.load([
    'enviroment/0/px.jpg',
    'enviroment/0/nx.jpg',
    'enviroment/0/py.jpg',
    'enviroment/0/ny.jpg',
    'enviroment/0/pz.jpg',
    'enviroment/0/nz.jpg',
])

const scene = new THREE.Scene()

scene.background = enviromentMapTexture
scene.environment = enviromentMapTexture


// 2. RGBELoader (It wraps the image like a "sphere" around the scene)
// We se when we have .hdr file(it conatains real light data)

// const rgbeLoader = new RGBELoader()
// rgbeLoader.load('enviroment/cobblestone_street_night_4k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping

//     scene.background = environmentMap
//     scene.environment = environmentMap
// })



window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)

})


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5

const canvas = document.querySelector('.webgl')

const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true


const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)


const material = new THREE.MeshStandardMaterial()

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), material)
sphere.position.x = - 2.5
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
const turos = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.4, 16, 32), material)
turos.position.x = 2.5

scene.add(sphere, plane, turos)


// 1. MESH BASIC MATERIAL

// material.color = new THREE.Color('blue')
// material.map = door
//this 2 works together
// material.opacity = 0.5
// material.transparent = true
// material.side = THREE.DoubleSide // to make visible bith side of plane



// 2. MESH NORMAL MATERIAL

// material.flatShading = true // to get small squares on the geometry
// material.side = THREE.DoubleSide



// 3.MESH MATCAP MATERIAL (Make my object look like this material(picture).)
// material.matcap = texture3



// 4. MESH LAMBERT MATERIAL(only works with light)

// ------ Ambient Light
// const ambientLight = new THREE.AmbientLight('white', 0.5)
// scene.add(ambientLight)

// ------ Point Light
// const pointLight = new THREE.PointLight('white', 100)
// pointLight.position.x = 0
// pointLight.position.y = -2
// pointLight.position.z = 2

// scene.add(pointLight)




// 5. MESH PHONG MATERIAL(only works with light)

// material.shininess = 100 // add the amount of shinning to it
// material.specular = new THREE.Color('white') // change color of reflection



// 6.MESH TOON MATERIAL : this one is cartoonish



// MESH STANDARD MATERIAL (works with light)
material.roughness = 0
material.metalness = 0.2


gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)





const time = new THREE.Clock()

const tick = () => {

    orbitControls.update()

    const elapsedTime = time.getElapsedTime()


    sphere.rotation.x = 0.5 * elapsedTime
    plane.rotation.x = 0.1 * elapsedTime
    turos.rotation.x = 0.5 * elapsedTime

    sphere.rotation.y = 0.5 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    turos.rotation.y = 0.5 * elapsedTime

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)

}

tick()
