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

let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

const vel = new THREE.Vector3()
const direction = new THREE.Vector3()
const vertex = new THREE.Vector3()
const color = new THREE.Color()

const objects = []

let scene = new THREE.Scene()
// const canvas = document.getElementById("canvas")
const renderer = new THREE.WebGLRenderer();
renderer.setSize( windowWidth, windowHeight );
document.body.appendChild( renderer.domElement );
// let renderer = new THREE.WebGLRenderer({
//     canvas,
//     // alpha: true,
//     // antialias:true
// });
let camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.05, 100) // perspective camera

camera.position.y = startingCameraHeight

scene.add(camera)

const floorGeo = new THREE.PlaneGeometry(1000, 1000)
const floorMat = new THREE.MeshPhongMaterial({color: 0x808080})
const floor = new THREE.Mesh(floorGeo, floorMat)

floor.rotateX(-Math.PI/2)

scene.add(floor)

// const boxGeo = new THREE.BoxGeometry(0.01, 0.01, 0.01)
// const boxMat = new THREE.MeshBasicMaterial({color: 0xff0000})
// const box = new THREE.Mesh(boxGeo, boxMat)

// box.position.y = 0.5
// box.position.z = 2

// scene.add(box)

let controls = new PointerLockControls(camera, document.body)

const blocker = document.getElementById("blocker")
const blockerText = document.getElementById("blockerText")
const crosshair = document.getElementById("crosshair")

crosshair.width = windowWidth
crosshair.height = windowHeight

const infoText = document.getElementById("infoText")

blockerText.addEventListener("click", () => {
    controls.lock()
})

controls.addEventListener('lock', () => {
    blocker.style.display = "none"
    blockerText.style.display = "none"
    crosshair.style.display = "block"
    infoText.style.display = "block"
})
controls.addEventListener("unlock", () => {
    blocker.style.display = "block"
    blockerText.style.display = ""
    crosshair.style.display = "none"
    infoText.style.display = "none"
    if(hasWon){
        blockerText.style.display = "none"
        winscreen.style.display = "block"
    }
})

scene.add(controls.getObject())

const ambientLight = new THREE.AmbientLight(0xffffff, 0.001)
// const ambientLight = new THREE.AmbientLight(0xffffff)

scene.add(ambientLight)



const raycaster = new THREE.Raycaster()


const loader = new GLTFLoader()


const loadedObjs = []
let loaded = 0
let hasWonYet = false
function loadModel(name){
    loader.load(`models/${name}.glb`, (gltf) => {
        scene.add(gltf.scene)
        loadedObjs.push(gltf.scene)
        loaded++
        if(loaded === 4){
            loaded = 0
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
loadModel('door')

/* corners : 
    x: 0.28  z: -1.15
    x: -1.54 z: -1.15
    x: -1.54 z: -1.9
    x: 0.28  z: -1.9
*/

let paperclipRotation
let pliersRotation

function placeObject(object){

    const height = (object == pliers) ? 0.011315741299757653 : 0.0050254474666067805

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
        pliersRotation = rotation
    } else {
        object.rotateZ(rotation)
        paperclipRotation = rotation
    }

}

function raycastTesting(){
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

function raycastItem(){
    raycaster.setFromCamera({x: 0, y: 0}, camera)
    const intersectedObjects = raycaster.intersectObject(scene)
    if(intersectedObjects){
        const firstObject = intersectedObjects[0].object
        if(firstObject.uuid == paperclip.uuid){
            pickupPaperclip()
        } else if(firstObject.uuid == pliers.uuid){
            pickupPliers()
        }
    }
}

function pickupPaperclip(){
    console.log("You picked up the paperclip!")
    camera.add(paperclip)
    paperclip.position.set(0, 0, 0)
    paperclip.rotateZ(-paperclipRotation)
    paperclip.rotateZ(Math.PI/2)
    paperclip.rotateY(-Math.PI/2)
    paperclip.position.z += -0.1
    paperclip.position.x += -0.05
    paperclip.position.y += -0.05
    paperclip.rotateY(0.3)
    inventory.push(paperclip)
}

function pickupPliers(){
    console.log("You picked up the pliers!")
    camera.add(pliers)
    pliers.position.set(0, 0, 0)
    pliers.rotateY(-pliersRotation)
    pliers.rotateY(Math.PI/2)
    pliers.rotateZ(Math.PI/2)
    pliers.position.z += -0.1
    pliers.position.x += 0.05
    pliers.position.y += -0.1
    pliers.rotateZ(-0.3)
    inventory.push(pliers)
    console.log(inventory)
}

let lightBolts = []
function genLightning(outside){

    const audioTrack = Math.floor(Math.random() * 4)
    const tracks = ['strike1', 'strike2', 'strike3', 'strike4']

    const audio = new Audio(`audio/${tracks[audioTrack]}.mp3`);
    audio.play();

    const lightBolt = new THREE.PointLight(0xffffff, 100, 100)

    let randPosX = Math.random() * 14 + 4
    randPosX *= Math.random() > 0.5 ? -1 : 1

    let randPosY = Math.random() * 14 + 4
    randPosY *= Math.random() > 0.5 ? -1 : 1
    
    if(outside){
        lightBolt.position.set(camera.position.x, camera.position.y, camera.position.z)
    }
    lightBolt.position.set(randPosX, 3, randPosY)
    scene.add(lightBolt)

    lightBolts.push(lightBolt)

}

function dimBolts(){
    for(let i = 0; i < lightBolts.length; i++){
        lightBolts[i].intensity /= 1.07
        if(lightBolts[i].intensity < 6){
            scene.remove(lightBolts[i])
            lightBolts[i].remove()
            lightBolts.splice(i, 1)
        }
    }
}

function craft(){
    if(lightBolts.length > 0 && inventory.length == 2){
        paperclip.rotateY(-0.3)
        // paperclip.rotateZ(-Math.PI/2)
        paperclip.rotateY(Math.PI/2)
        pliers.rotateZ(0.3)
        // pliers.rotateY(-Math.PI/2)
        pliers.rotateZ(-Math.PI/2)
        camera.remove(pliers)
        camera.remove(paperclip)
        hasLockPick = true
        lockpickHelp.style.display = 'none'
        lockedDoorHelp.style.display = 'block'
        setTimeout(() => {lockedDoorHelp.style.display = 'none'}, 1000)
        inventory = []
    }
}

function unlockDoor(){
    if(hasLockPick){
        raycaster.setFromCamera({x: 0, y: 0}, camera)
        const intersectedObjects = raycaster.intersectObject(scene)
        if(intersectedObjects){
            const obj = intersectedObjects[0].object
            if(obj == door.children[0] || obj == door.children[1] || obj == door.children[2]){
                if(camera.position.z < -1 && lightBolts.length > 0){
                    scene.remove(door)
                    hasLockPick = false
                    hasOpenedDoor = true
                }
            }
        }
    }
}

const winscreen = document.getElementById("winscreen")
const timerText = document.getElementById("time")

let hasWon = false
let bestTime
let sessionTime
let startTime = 0
function win(){
    // controls.unlock()
    hasWon = true
    hasWonYet = true
    sessionTime = (Date.now() - startTime)/1000
    document.exitPointerLock()
    if(bestTime){
        if(sessionTime < bestTime){
            bestTime = sessionTime
        }
    } else {
        bestTime = sessionTime
    }
    timerText.innerHTML = `Your time was ${sessionTime} seconds and your best time this session was ${bestTime} seconds`
    // blockerText.style.display = "none"
    // winscreen.style.display = 'block'

}


winscreen.onclick = () => {
    inventory = []
    hasLockPick = false
    hasOpenedDoor = false
    hasWon = false



    scene.add(pliers)
    scene.add(paperclip)
    scene.add(door)

    console.log(paperclip)

    // pliers.rotation._x = 0
    // pliers.rotation._y = 1.2587250459359334
    // pliers.rotation._z = 0

    // paperclip.rotation._x = -1.570796461153735
    // paperclip.rotation._y = 0
    // paperclip.rotation._z = 0.6388592249955947
    

    placeObject(pliers)
    placeObject(paperclip)

    // scene.add(pliers)
    // scene.add(paperclip)
    // scene.add(door)

    lightBolts = []

    winscreen.style.display = 'none'

    scene.children.forEach((el, i) => {
        if(el.type == "PointLight"){
            scene.remove(el)
            el.remove()
        }
    })

    camera.position.set(0,startingCameraHeight,0)
    camera.lookAt(0, startingCameraHeight, -1)

    controls.lock()


    startTime = Date.now()

    render()
}

renderer.render(scene, camera)

let pliers
let paperclip
let room
let door

let inventory = []
let hasLockPick = false
let hasOpenedDoor = false

const lockpickHelp = document.getElementById("lockpickHelp")
const unlockDoorHelp = document.getElementById("unlockDoorHelp")
const lockedDoorHelp = document.getElementById("lockedDoorHelp")

function init(){
    pliers = loadedObjs[0].children[0] 
    paperclip = loadedObjs[1].children[0] 
    room = loadedObjs[2]
    door = loadedObjs[3]


    paperclip.material = pliers.material

    paperclip.scale.x *= 4
    paperclip.scale.y *= 4
    paperclip.scale.z *= 4

    placeObject(pliers)
    placeObject(paperclip)


    // for(let i = 0; i < room.children.length; i++){
    //     const child = room.children[i]
    //     child.material = new THREE.MeshPhongMaterial({color: 0x666666})
    //     console.log(child)
    // }

    // room.children.forEach((child) => {
    //     // child.Mesh = THREE.Mesh()
    //     console.log(room)
    // })
    startTime = Date.now()
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

        dimBolts()

        // 1/120 chance per frame for lightning bolt
        if(Math.random() < 1/120){
            let pliersInInv = false
            let paperclipInInv = false
            inventory.forEach((el) => {
                if(el === pliers) pliersInInv = true
                if(el === paperclip) paperclipInInv = true
            })
    
            if(!paperclipInInv) placeObject(paperclip)
            if(!pliersInInv) placeObject(pliers)
    
            if(hasOpenedDoor && camera.position.z < -2.2){
                genLightning(true)
                win()
                return
            }
            genLightning()
    
            
        }
    
        // checking for ability to craft lockpick (needs both items and light)
        if(inventory.length == 2 && lightBolts.length > 0){
            lockpickHelp.style.display = 'block'
        } else {
            lockpickHelp.style.display = 'none'
        }
    
        if(hasLockPick){
            raycaster.setFromCamera({x: 0, y: 0}, camera)
            const intersectedObjects = raycaster.intersectObject(scene)
            if(intersectedObjects){
                const obj = intersectedObjects[0].object
                if(obj == door.children[0] || obj == door.children[1] || obj == door.children[2]){
                    console.log(" HAPP Y")
                    if(camera.position.z < -1 && lightBolts.length > 0){
                        unlockDoorHelp.style.display = 'block'
                    } else {
                        unlockDoorHelp.style.display = 'none'
                    }
                } else {
                    unlockDoorHelp.style.display = 'none'
                }
            }
        } else {
            unlockDoorHelp.style.display = 'none'
        }

    }

    

    // fps stuff
    renderer.render(scene, camera)
    // console.log(time - time2)
    time2 = time
    const elapsed = Date.now() - start
    start = -1
    if(!hasWon) setTimeout(requestAnimationFrame, 1000/frameRate - elapsed, render)
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
    if(!hasOpenedDoor && position.z < -2.05){
        position.z = -2.05
    }
    // wall with door
    if(position.x > 1.45 && position.z < -2.05 && position.z > -2.15){
        position.z = -2.05
    }
    if(position.x < 0.56 && position.z < -2.05 && position.z > -2.15){
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
        case 'f':
            unlockDoor()
            break;
        case 'g':
            // genLightning()
            // raycastTesting()
            // win()
            // console.log(paperclip)
            break;
        case 'e':
            raycastItem()
            break;
        case 'c':
            craft()
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

// crosshair creation code
let ctx = crosshair.getContext("2d")
ctx.fillStyle = 'white'
ctx.beginPath()
ctx.arc(windowWidth/2, windowHeight/2, 4, 0, 2 * Math.PI)
ctx.fill()
ctx.stroke()

function onWindowResize() {

    console.log('resize')

    windowWidth = window.innerWidth * 0.9
    windowHeight = window.innerHeight * 0.9

    crosshair.width = windowWidth
    crosshair.height = windowHeight

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( windowWidth, windowHeight );

}

window.onresize = onWindowResize