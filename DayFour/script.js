import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'




const sizes = {
    width: window.innerWidth,
    height: innerHeight
}


window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)

})


// Creating Texture using Image manually

// const image = new Image()
// const texture = new THREE.Texture(image)
// image.src = 'color.jpg'

// image.onload = () => {
//     texture.needsUpdate = true
// }


// Creating Texture using Image with builtin functions

const loadingManager = new THREE.LoadingManager()

// loadingManager.onStart = () => {
//     console.log('onStart')
// }

// loadingManager.onLoad = () => {
//     console.log('onLoad')
// }

// loadingManager.onProgress = () => {
//     console.log("onProgress")
// }

// loadingManager.onError = () => {
//     console.log('Error')
// }

const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load('color.jpg')



texture.repeat.x = 2
// texture.repeat.y = 4
texture.wrapS = THREE.RepeatWrapping
// texture.wrapT = THREE.RepeatWrapping
// texture.wrapS = THREE.MirroredRepeatWrapping
// texture.wrapT = THREE.MirroredRepeatWrapping

//texture.offset.x = 0.5
texture.rotation = Math.PI / 4
texture.center.x = 0.5
texture.center.y = 0.5

// texture.generateMipmaps = false
// texture.minFilter = THREE.NearestFilter
// texture.magFilter = THREE.NearestFilter




const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5

const canvas = document.querySelector('.webgl')

const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true


const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2, 2, 2, 2), new THREE.MeshBasicMaterial({ map: texture }))
scene.add(cube)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)


const tick = () => {
    orbitControls.update()

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)

}

tick()


