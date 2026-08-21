import * as THREE from 'three'

const scene = new THREE.Scene()

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 'blue' })

const mesh = new THREE.Mesh(geometry, material)

mesh.scale.x = 5.5
mesh.scale.y = 0.5
mesh.scale.z = 0.5


scene.add(mesh)

const sizes = {
    height: 300,
    width: 400
}

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height
)

camera.position.z = 5

const canvas = document.getElementsByClassName("webgl")[0]

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)

const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32)

const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 'red'
})

const sphere = new THREE.Mesh(
    sphereGeometry,
    sphereMaterial
)

sphere.position.x = 0

scene.add(sphere)

const orbitGeometry = new THREE.SphereGeometry(0.3, 32, 32)

const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 'yellow'
})

const orbitSphere = new THREE.Mesh(
    orbitGeometry,
    orbitMaterial
)

orbitSphere.position.y = 1


scene.add(orbitSphere)



const timer = new THREE.Timer()

const rot = () => {
    timer.update()

    const deltaTime = timer.getDelta()
    const elapsedtime = timer.getElapsed()

    mesh.rotateX(deltaTime * 4)

    sphere.position.y =
        Math.abs(Math.sin(elapsedtime * 2)) * 2.7 + 0.5



    orbitSphere.position.x =
        Math.sin(elapsedtime) * -2
    orbitSphere.position.y =
        Math.sin(elapsedtime) * 2

    orbitSphere.position.z =
        Math.cos(elapsedtime) * 2





    renderer.render(scene, camera)

    window.requestAnimationFrame(rot)
}

rot()