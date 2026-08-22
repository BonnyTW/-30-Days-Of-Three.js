import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Base Setup
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const sizes = {
    width: 800,
    height: 700
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 7
camera.position.y = 2


// Controls
const orbitControls = new OrbitControls(camera, canvas)
orbitControls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)


// TABLE
const table = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 7), new THREE.MeshBasicMaterial({ color: 'blue' }))
scene.add(table)

//TABLE LEG
const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 'brown' }))
scene.add(leg1)
leg1.position.x = - 2.3
leg1.position.y = -0.55
leg1.position.z = 3.4

const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 'brown' }))
scene.add(leg2)
leg2.position.x = 2.3
leg2.position.y = -0.55
leg2.position.z = 3.4

const leg3 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 'brown' }))
scene.add(leg3)
leg3.position.x = - 2.3
leg3.position.y = -0.55
leg3.position.z = - 3.4

const leg4 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), new THREE.MeshBasicMaterial({ color: 'brown' }))
scene.add(leg4)
leg4.position.x = 2.3
leg4.position.y = -0.55
leg4.position.z = -3.4



// Tennis Ball
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16), new THREE.MeshBasicMaterial({ color: 'orange' }))
scene.add(ball)
ball.position.z = 3
ball.position.y = 0.5




// NET
const netWidth = 5
const netHeight = 0.4
const divisionsX = 25
const divisionsY = 7

const points = []

for (let y = 0; y <= divisionsY; y++) {
    const height = 0.1 + (y / divisionsY) * netHeight

    for (let x = 0; x < divisionsX; x++) {
        const x1 = -netWidth / 2 + (x / divisionsX) * netWidth
        const x2 = -netWidth / 2 + ((x + 1) / divisionsX) * netWidth

        points.push(x1, height, 0)
        points.push(x2, height, 0)
    }
}

for (let x = 0; x <= divisionsX; x++) {
    const posX = -netWidth / 2 + (x / divisionsX) * netWidth

    for (let y = 0; y < divisionsY; y++) {
        const y1 = 0.1 + (y / divisionsY) * netHeight
        const y2 = 0.1 + ((y + 1) / divisionsY) * netHeight

        points.push(posX, y1, 0)
        points.push(posX, y2, 0)
    }
}

const netGeometry = new THREE.BufferGeometry()
netGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(points, 3)
)

const netMaterial = new THREE.LineBasicMaterial({
    color: 'white'
})

const net = new THREE.LineSegments(netGeometry, netMaterial)

scene.add(net)


//Racket
const racket1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), new THREE.MeshBasicMaterial({ color: 'red' }))
racket1.scale.set(1, 1.2, 0.15)
racket1.position.z = 3.8
racket1.position.y = 0.5

const racket2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 16), new THREE.MeshBasicMaterial({ color: 'red' }))
racket2.scale.set(1, 1.2, 0.15)
racket2.position.z = - 3.8
racket2.position.y = 0.5

scene.add(racket1)
scene.add(racket2)

//Racket Stick
const Stick1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 'gray' }))
Stick1.position.z = 3.8
scene.add(Stick1)

const Stick2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 'gray' }))
Stick2.position.z = - 3.8
scene.add(Stick2)


// Cursor Tracking
const cursor = { x: 0, y: 0 }
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = -(event.clientY / sizes.height - 0.5)
})

// Game Variables
let ballSpeedX = 0.04
let ballSpeedZ = 0.06
let ballSpeedY = 0.08  // upward velocity for the arc
const gravity = -0.003  // pulls the ball down each frame
let lastHitBy = 'none'  // tracks who hit the ball last: 'player' or 'ai'
let isWaiting = false    // true during the 2-second delay after a score
let gameStarted = false  // game hasn't started yet — orbit freely!

// Start Button
const startBtn = document.getElementById('startBtn')
startBtn.addEventListener('click', () => {
    gameStarted = true
    startBtn.classList.add('hidden')
    resetBall()
})

function resetBall() {
    ball.position.set(0, 0.5, 0)
    ballSpeedX = 0.04 * (Math.random() > 0.5 ? 1 : -1)
    ballSpeedZ = 0.06 * (Math.random() > 0.5 ? 1 : -1)
    ballSpeedY = 0.08
    lastHitBy = 'none'
    isWaiting = false
    ball.visible = true
}

// Animation Loop
const tick = () => {
    orbitControls.update()

    // Only move paddles and ball after game starts
    if (gameStarted) {
        // Player Racket follows mouse
        racket1.position.x = cursor.x * 5
        Stick1.position.x = cursor.x * 5

        // AI Racket follows the ball (slightly slower so it's beatable)
        let aiTarget = ball.position.x * 0.85
        racket2.position.x += (aiTarget - racket2.position.x) * 0.08
        Stick2.position.x = racket2.position.x

        // Only move ball if not waiting
        if (!isWaiting) {
            // Move the ball
            ball.position.x += ballSpeedX
            ball.position.z += ballSpeedZ
            ball.position.y += ballSpeedY
            ballSpeedY += gravity  // gravity pulls it down

            // Ball bounces off the table surface — ONLY on opponent's half
            if (ball.position.y <= 0.25) {
                // Player hit it → bounce only on AI's half (z < 0)
                // AI hit it → bounce only on player's half (z > 0)
                if ((lastHitBy === 'player' && ball.position.z < 0) ||
                    (lastHitBy === 'ai' && ball.position.z > 0) ||
                    lastHitBy === 'none') {
                    ball.position.y = 0.25
                    ballSpeedY = Math.abs(ballSpeedY) * 0.8  // small bounce off table
                }
            }

            // Ball fell below the table (missed the correct half) → score!
            if (ball.position.y < -1) {
                ball.visible = false
                isWaiting = true
                setTimeout(resetBall, 2000)
            }

            // Bounce off side walls (left/right edges of the table)
            if (ball.position.x > 2.3 || ball.position.x < -2.3) {
                ballSpeedX *= -1
            }

            // Player Racket hit (your side, z ~ 3.8)
            if (ball.position.z > 3.5 && ball.position.z < 4.1) {
                if (Math.abs(ball.position.x - racket1.position.x) < 0.5) {
                    ballSpeedZ = -Math.abs(ballSpeedZ)  // send it towards AI
                    ballSpeedY = 0.08  // arc it up and over the net
                    ballSpeedX = (ball.position.x - racket1.position.x) * 0.15
                    lastHitBy = 'player'
                }
            }

            // AI Racket hit (far side, z ~ -3.8)
            if (ball.position.z < -3.5 && ball.position.z > -4.1) {
                if (Math.abs(ball.position.x - racket2.position.x) < 0.5) {
                    ballSpeedZ = Math.abs(ballSpeedZ)  // send it towards player
                    ballSpeedY = 0.08  // arc it up
                    ballSpeedX = (ball.position.x - racket2.position.x) * 0.15
                    lastHitBy = 'ai'
                }
            }

            // Ball went past the table → score!
            if (ball.position.z > 5 || ball.position.z < -5) {
                ball.visible = false
                isWaiting = true
                setTimeout(resetBall, 2000)
            }
        }
    } // end gameStarted

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
