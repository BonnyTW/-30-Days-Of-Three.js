# Day 3 - 30 Days of Three.js

## Overview
Day 3 focuses on fullscreen rendering, responsive resizing, pixel ratio, custom BufferGeometry, and debug UI.

## What I Learned
- **Fullscreen Rendering** — Using `window.innerWidth / innerHeight` instead of hardcoded sizes
- **Responsive Resizing** — Listening for `resize` events to update camera aspect ratio, projection matrix, and renderer
- **Pixel Ratio** — `renderer.setPixelRatio()` for sharp rendering on Retina/high-DPI screens, capped at 2 for performance
- **Custom BufferGeometry** — Building geometry from raw `Float32Array` data (`count * 3 * 3` triangle math)
- **Debug UI (lil-gui)** — Adding a real-time control panel with sliders, color pickers, checkboxes, buttons, and organized folders

## Tech Stack
- HTML / CSS / JavaScript
- [Three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [lil-gui](https://lil-gui.georgealways.com/)
- Vite (Development Server)

## How to Run
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
