import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
const frameRate = 60

const startingCameraHeight = 10

let movingForward = false
let movingBackward = false
let movingLeft = false
let movingRight = false

const vel = new THREE.Vector3()
const direction = new THREE.Vector3()
const vertex = new THREE.Vector3()
const color = new THREE.Color()

const objects = []

let scene = new THREE.Scene()
const canvas = document.getElementById("canvas")
let renderer = new THREE.WebGLRenderer({
    canvas,
    // alpha: true,
    // antialias:true
});
let camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 100) // perspective camera

camera.position.x = 3
camera.position.y = startingCameraHeight

camera.lookAt(0,0,0)
scene.add(camera)

const floorGeo = new THREE.PlaneGeometry(1000, 1000)
const floorMat = new THREE.MeshBasicMaterial({color: 0x808080})
const floor = new THREE.Mesh(floorGeo, floorMat)

floor.rotateX(-Math.PI/2)

scene.add(floor)

const boxGeo = new THREE.BoxGeometry(1, 1, 1)
const boxMat = new THREE.MeshBasicMaterial({color: 0xff0000})
const box = new THREE.Mesh(boxGeo, boxMat)

box.position.y = 1

scene.add(box)

let controls = new PointerLockControls(camera, document.body)

const blocker = document.getElementById("blocker")
const blockerText = document.getElementById("blockerText")

blockerText.addEventListener("click", () => {
    controls.lock()
})

controls.addEventListener('lock', () => {
    blocker.style.display = "none"
    blockerText.style.display = "none"
})
controls.addEventListener("unlock", () => {
    blocker.style.display = "block"
    blockerText.style.display = ""
})

scene.add(controls.getObject())

let raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10)


renderer.render(scene, camera)

let time2
let start
let vx = 0
let vz = 0
function render(time){
    if(start === -1){
        start = Date.now()
    }
    // render loop

    if(controls.isLocked === true){

        move()


    }






    // fps stuff
    renderer.render(scene, camera)
    // console.log(time - time2)
    time2 = time
    const elapsed = Date.now() - start
    start = -1
    setTimeout(requestAnimationFrame, 1000/frameRate - elapsed, render)
}

render()

// logic

const runSpeed = 0.1
const accel = 0.2

function move(){
    if(movingForward){
        controls.moveForward(runSpeed)
    }
    if(movingBackward){
        controls.moveForward(-runSpeed)
    }
    if(movingLeft){
        controls.moveRight(-runSpeed)
    }
    if(movingRight){
        controls.moveRight(runSpeed)
    }
}

document.addEventListener("keydown", (event) => {
    event.isComposing ? console.log("composing") : ""
    const key = event.key
    console.log(event.key)
    switch (key.toLowerCase()) {
        case 'w':
            movingForward = true
            break;
        case 'a':
            movingLeft = true
            break
        case 's':
            movingBackward = true
            break
        case 'd':
            movingRight = true
            break;
    } 
})

document.addEventListener("keyup", (event) => {
    event.isComposing ? console.log("composing") : ""
    const key = event.key
    // console.log(key)
    switch (key.toLowerCase()) {
        case 'w':
            movingForward = false
            break;
        case 'a':
            movingLeft = false
            break
        case 's':
            movingBackward = false
            break
        case 'd':
            movingRight = false
            break;
    } 
})
