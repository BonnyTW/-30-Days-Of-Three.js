# 🏓 3D Table Tennis Game

A simple 3D ping pong game built with Three.js using only basic concepts learned in the first two days of the 30 Days of Three.js challenge.

## How to Play
1. Click **"Start Game"** to begin
2. Move your mouse **left/right** to control the red racket
3. Hit the ball and try to get it past the AI!

## Features
- **Player-controlled racket** using mouse movement
- **AI opponent** that tracks the ball with slight delay (beatable!)
- **Ball physics** with gravity and arcing over the net
- **Table bounce rules** — ball only bounces on the opponent's half
- **Auto-reset** with 2-second delay after scoring
- **OrbitControls** — orbit around the scene before and during the game

## Built With (Only Day 1 & 2 Knowledge)
- `BoxGeometry` — Table, legs, racket handles
- `SphereGeometry` — Ball and racket faces (scaled flat)
- `BufferGeometry` + `LineSegments` — The net grid
- `OrbitControls` — Camera orbiting
- Mouse event listeners — Player input
- `requestAnimationFrame` — Game loop

## Tech Stack
- HTML / CSS / JavaScript
- [Three.js](https://threejs.org/)
- Vite (Development Server)
