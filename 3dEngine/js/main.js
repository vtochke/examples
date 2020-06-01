console.time('webgl');
import {event} from './event.js';
import {_} from './systems/_.js';
import {_transform} from './systems/_transform.js';
import {_control} from './systems/_control.js';
import {perspectiveCamera} from './entitys/cameras/perspectiveCamera.js';
import {box,plane} from './entitys/geometry/box.js';
import {directLight} from './entitys/lights/directLight.js';

//let camera = _.camera(70, 0.1, 1000.0);
let camera = new perspectiveCamera(70, 0.1, 1000.0, _.aspect);
//camera.position.set([0, 5, -10]);
camera.translate([0, -5, -10]);
//camera.rotate(Math.PI, [0,1,0]);
//camera.lookAt([0, 1, 0]);
//TODO разобраться с матрицами

let person = new _control(camera);

//_.setupLights();
//_.setTextures();
let boxGeom1 = new box(1,1,1);
_.scene.add(boxGeom1);
boxGeom1.translate([0,1,0]);
boxGeom1.material.texture = _.texture("/3d/img/brick2.jpg");
let boxGeom2 = new box(2,1,1);
_.scene.add(boxGeom2);
boxGeom2.translate([3,1,5]);
boxGeom2.material.texture = _.texture("/3d/img/brick.jpg");
let boxGeom3 = new box(1,3,1);
boxGeom3.material.wireframe = true;
boxGeom1.add(boxGeom3);
boxGeom3.translate([-3,0,0]);
//boxGeom1.add(boxGeom3);

let planeGeom = new plane(10,10);
_.scene.add(planeGeom);

console.timeLog('webgl');

let aga;
for (let i=0;i<1000;i++ ) {
    aga = new box(0.5,0.5,0.5);
    //aga.material.instanced = true;
    _.scene.add(aga);
    aga.translate([Math.random()*10,Math.random()*10,Math.random()*10]);
}

console.timeLog('webgl');

//let light = directLight([0,0,5]);
//_.scene.add(directLight);

let angle = 0.01;
let axis = [1, 1, 0];
function handleKeyDown(e){
    camera.needsUpdate = true;
    switch(e.keyCode)
    {
        case 39:  // стрелка вправо
            axis = [0,1,0];
        angle = 0.01;
            break;
        case 37:  // стрелка влево
            axis = [0,1,0];
        angle = -0.01;
            break;
        case 40:  // стрелка вниз
            axis = [1,0,0];
        angle = -0.01;
            break;
        case 38:  // стрелка вверх
            axis = [1,0,0];
        angle = 0.01;
            break;
    }
}
function touchMouseStart() {
    axis = [0,1,0];
    angle = -0.01;
}
function touchMouseEnd() {
    axis = [1,0,0];
    angle = 0.01;
}
/*document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener("mousedown", touchMouseStart, false);
document.addEventListener("mouseup", touchMouseEnd, false);
document.addEventListener("touchstart", touchMouseStart, false);
document.addEventListener("touchend", touchMouseEnd, false);*/
    
(function animate(){
    //camera.rotate(angle, axis);
    //boxGeom3.rotation.z += 0.01;
    person.update();
    _transform.update();
    _.draw(camera);
    window.requestAnimationFrame(animate);
}())

console.timeLog('webgl');