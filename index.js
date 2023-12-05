import * as THREE from 'three';
const frameRate = 60


export const scene = new THREE.Scene()
const canvas = document.getElementById("canvas")
const renderer = new THREE.WebGLRenderer({
    canvas,
    // alpha: true,
    // antialias:true
});
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 100) // perspective camera

camera.position.x = 3
camera.lookAt(0,0,0)
scene.add(camera)

const boxGeo = new THREE.BoxGeometry(1, 1, 1)
const boxMat = new THREE.MeshBasicMaterial({color: 0xff0000})
const box = new THREE.Mesh(boxGeo, boxMat)
scene.add(box)

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

    camera.position.x += vx
    camera.position.z += vz






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

const runSpeed = 2
const accel = 0.2

document.addEventListener("keydown", (event) => {
    event.isComposing ? console.log("composing") : ""
    const key = event.key
    console.log(key)
    if(key === "Escape"){
        
    }

    switch (key.toLowerCase()) {
        case 'w':
            if (vx < runSpeed){
                vx += accel
            } else vx = runSpeed
            break;
        case 'a':
            if (vz > -runSpeed){
                vz -= accel
            } else vz = -runSpeed
            break
        case 's':
            if (vx > -runSpeed){
                vx -= accel
            } else vx = -runSpeed
            break
        case 'd':
            if (vz < runSpeed){
                vz += accel
            } else vz = runSpeed
            break;
    }   
})

document.addEventListener("keyup", (event) => {
    event.isComposing ? console.log("composing") : ""
    const key = event.key
    console.log(key)
    switch (key.toLowerCase()) {
        case 'w':
            vx -= vx
            break;
        case 'a':
            vz -= vz
            break;
        case 's':
            vx -= vx
            break;
        case 'd':
            vz -= vz
            break;
    }  
})