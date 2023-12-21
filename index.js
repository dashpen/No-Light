import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const frameRate = 60

const startingCameraHeight = 1.6
const startingRunSpeed = 0.05

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

camera.position.y = startingCameraHeight

camera.lookAt(0,0,0)
scene.add(camera)

const floorGeo = new THREE.PlaneGeometry(1000, 1000)
const floorMat = new THREE.MeshPhongMaterial({color: 0x808080})
const floor = new THREE.Mesh(floorGeo, floorMat)

floor.rotateX(-Math.PI/2)

scene.add(floor)

const boxGeo = new THREE.BoxGeometry(0.01, 0.01, 0.01)
const boxMat = new THREE.MeshBasicMaterial({color: 0xff0000})
const box = new THREE.Mesh(boxGeo, boxMat)

box.position.y = 0.5
box.position.z = 2

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

const ambientLight = new THREE.AmbientLight(0xffffff)

scene.add(ambientLight)

const raycaster = new THREE.Raycaster()


const loader = new GLTFLoader()

let paperclipMesh = new THREE.Mesh()

const numModels = 3

const loadedObjs = []
let loaded = 0

function loadModel(name){
    loader.load(`models/${name}.glb`, (gltf) => {
        scene.add(gltf.scene)
        // console.log(gltf.scene)
        loadedObjs.push(gltf.scene)
        loaded++
        if(loaded === 3){
            init()
        }
    },
    (xhr) => {
        console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');

    },
    function (error) {
        console.log( 'An error happened' + error);
    }
    )
}

loadModel('pliers')
loadModel('paperclip')
loadModel('roomproto')

/* corners : 
    x: 0.28  z: -1.15
    x: -1.54 z: -1.15
    x: -1.54 z: -1.9
    x: 0.28  z: -1.9
*/

function placeObject(object, height){

    const xRange = 0.28 + 1.54
    const zRange = 1.9 - 1.15

    const xShift = Math.random() * xRange
    const zShift = Math.random() * zRange

    const finalx = 0.28 - xShift
    const finaly = 0.7726
    const finalz = -1.15 - zShift

    object.position.set(finalx, finaly + height/2, finalz)

    const rotation = Math.random() * Math.PI

    if(height === 0.011315741299757653){
        object.rotateY(rotation)
    } else {
        object.rotateZ(rotation)
    }

}

function raycast(){
    raycaster.setFromCamera({x: 0, y: 0}, camera)
    const intersectedObjects = raycaster.intersectObject(scene)
    if(intersectedObjects){
        console.log(intersectedObjects)
        const position = intersectedObjects[0].point
        // intersectedObjects[0].object.material.color.set(0x000000)
        // setTimeout(() => {}, 100)
        box.position.set(position.x, position.y, position.z)
        console.log(box.position)
        console.log(position)
    }
}

renderer.render(scene, camera)

function init(){
    const pliers = loadedObjs[0].children[0] 
    const paperclip = loadedObjs[1].children[0] 
    const room = loadedObjs[2]

    paperclip.scale.x *= 2
    paperclip.scale.y *= 2
    paperclip.scale.z *= 2

    placeObject(pliers, 0.011315741299757653)
    placeObject(paperclip, 0.0050254474666067805)

    console.log(paperclip)



    // for(let i = 0; i < room.children.length; i++){
    //     const child = room.children[i]
    //     child.material = new THREE.MeshPhongMaterial({color: 0x666666})
    //     console.log(child)
    // }

    // room.children.forEach((child) => {
    //     // child.Mesh = THREE.Mesh()
    //     console.log(room)
    // })

    render()
}


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


// logic

let runSpeed = startingRunSpeed
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

    const cameraWidth = 0.5
    const cameraLength = 0.5

    const position = camera.position
    // walls
    if(position.x > 1.7){
        position.x = 1.7
    }
    if(position.x < -1.7){
        position.x = -1.7
    }
    if(position.z > 2.05){
        position.z = 2.05
    }
    // wall with door
    if(position.x > 1.45 && position.z < -2.05){
        position.z = -2.05
    }
    if(position.x < 0.56 && position.z < -2.05){
        position.z = -2.05
    }
    // table
    if(position.z < -1 && position.x > 0.35 && position.x < 0.45){
        position.x = 0.45
    }
    if(position.x < 0.45 && position.z < -1 && position.z > -1.2){
        position.z = -1
    }
    // bed
    if(position.z > 0.98 && position.x > -0.8 && position.x < -0.7){
        position.x = -0.8
    }
    if(position.x > -0.8 && position.z > 0.98 && position.z < 1.08){
        position.z = 0.98
    }
}

// key stuff

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
        case 'shift':
            enterSneak()
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
        case 'shift':
            exitSneak()
            break;
        case 'f':
            console.log(camera.position)
            break;
        case 'g':
            raycast()
            break;
    } 
})

function enterSneak(){
    camera.position.y = startingCameraHeight / 2
    runSpeed = startingRunSpeed/4
}

function exitSneak(){
    camera.position.y = startingCameraHeight
    runSpeed = startingRunSpeed
}