import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


const sizes = {
    width: 800,
    height: 600
}



const cursor = {
    x: 0,
    y: 0
}

// getting cursor position
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5

    cursor.y = - (event.clientY / sizes.height - 0.5)
})


const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5

const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 'red' }))
scene.add(cube)

const canvas = document.querySelector('.webgl')


// ORBIT CONTROL
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true

//orbitControls.dampingFactor = 0.05



const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)

// GSAP

// gsap.to(cube.position, { duration: 2, x: 3 })
// gsap.to(cube.position, { duration: 2, x: 0, delay: 1.5 })

// gsap.to(cube.rotation, {
//     y: 2 * Math.PI,
//     duration: 5
// })

// gsap.to(cube.scale, {
//     x: 2,
//     y: 2,
//     z: 2,
//     duration: 2
// })

// gsap.to(cube.scale, {
//     x: 1,
//     y: 1,
//     z: 1,
//     duration: 2,
//     delay: 3
// })


const tick = () => {

    // update Camera using cursor
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = cursor.y * 3
    // camera.lookAt(cube.position)


    orbitControls.update()



    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

