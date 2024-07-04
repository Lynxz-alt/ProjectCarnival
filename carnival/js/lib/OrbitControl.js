import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls;
let path, routeIndex = 0, moveCamera = false;

init();
animate();

function init() {
    // Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);

    // Geometry (for example, a simple box)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Define the path for the camera to follow
    path = [
        new THREE.Vector3(0, 1.6, 5),
        new THREE.Vector3(5, 1.6, 0),
        new THREE.Vector3(0, 1.6, -5),
        new THREE.Vector3(-5, 1.6, 0),
        new THREE.Vector3(0, 1.6, 5)
    ];

    // Event listener for keypress
    window.addEventListener('keydown', onKeyDown, false);
}

function onKeyDown(event) {
    if (event.key === 'g' || event.key === 'G') {
        moveCamera = !moveCamera;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (moveCamera && path.length > 0) {
        camera.position.lerp(path[routeIndex], 0.02);
        if (camera.position.distanceTo(path[routeIndex]) < 0.1) {
            routeIndex = (routeIndex + 1) % path.length;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}