import {config} from '../config.js';
import {vec3} from '../components/maths/vector.js';

let time,
    prevTime,
    allTime = 0,
    delta,
    movementX,
    movementY,
    border = config.worldBorder*0.5,
    //velocity = new THREE.Vector3(),
    //directionMove = new THREE.Vector3(),
    PI_2 = Math.PI / 2,
    PI_4 = Math.PI / 4,
    directionMove = new vec3(),
    target = new vec3(),
    canJump = true,
    scene,
    domElement = document.querySelector("body")
    //direction = new THREE.Vector3( 0, 1, 0 ),
    //rotation = new THREE.Euler( 0, 0, 0, 'ZXY' );
;

let _control = function (camera) {

    let options = {
        isLocked : false,
        speedRotation : 0.02,
        jumpSpeed : config.m*25, // 2,5 м/с
        moveSpeed : config.m, // 7 м/с
        brakingSpeed : 10,
        weight: config.weight*100,
        height: config.m*2,
        move: false,
    };
    
    for (let i in options) this[i] = options[i];
    
    this.camera = camera;
    this.connect();
}

_control.prototype = Object.assign( _control.prototype, {
    onMouseMove( e ) {
        //if ( !this.isLocked ) return;

        movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
        target.x -= movementX * this.speedRotation;
        target.y -= movementY * this.speedRotation;
        //this.yawObject.rotation.z -= movementX * this.speedRotation;
        //this.pitchObject.rotation.x -= movementY * this.speedRotation;

        //this.pitchObject.rotation.x = Math.max( -PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );

    },
    
    onKeyDown ( e ) {
        this.move = true;
        switch ( e.keyCode ) {
            case 38: // up
            case 87: // w
                directionMove.z = 1;
            break;
            case 37: // left
            case 65: // a
                directionMove.x = 1;
            break;
            case 40: // down
            case 83: // s
                directionMove.z = -1;
            break;
            case 39: // right
            case 68: // d
                directionMove.x = -1;
            break;
            case 32: // space
                //if (canJump) velocity.z += this.jumpSpeed;
                canJump = false;
            break;
        }
    },

    onKeyUp ( e ) {
        this.move = false;
        switch ( e.keyCode ) {
            case 38: // up
            case 87: // w
                directionMove.z = 0;
            break;
            case 37: // left
            case 65: // a
                directionMove.x = 0;
            break;
            case 40: // down
            case 83: // s
                directionMove.z = 0;
            break;
            case 39: // right
            case 68: // d
                directionMove.x = 0;
            break;
        }
        
    },
    
    connect () {
        document.addEventListener( 'mousemove', e => { this.onMouseMove (e) }, false );
        document.addEventListener( 'keydown', e => { this.onKeyDown (e) }, false );
        document.addEventListener( 'keyup', e => { this.onKeyUp (e) }, false );
        document.addEventListener( 'pointerlockchange', e => { this.onPointerlockChange (e) }, false );
        document.addEventListener( 'pointerlockerror', this.onPointerlockError, false );
        domElement.addEventListener( 'click', () => {
            if (!this.isLocked) this.lock();
        }, false );

    },
    disconnect () {
        document.removeEventListener( 'mousemove', this.onMouseMove (e), false );
        document.removeEventListener( 'pointerlockchange', this.onPointerlockChange, false );
        document.removeEventListener( 'pointerlockerror', this.onPointerlockError, false );
    },
    
    onPointerlockChange ( e ) {
        if ( document.pointerLockElement === domElement ) {
            this.isLocked = true;
        } else {
            this.unlock();
            this.isLocked = false;
        }
    },

    onPointerlockError() {
        console.error( 'Unable to use Pointer Lock API' );
    },
    
    lock () {
        prevTime = performance.now();
        domElement.requestPointerLock();
    },

    unlock () {
        document.exitPointerLock();
    },
    update () {
        if (this.isLocked) {
            time = performance.now();
            delta = ( time - prevTime ) / 1000;

//TODO разобраться с матрицами
            if (this.move) {
                directionMove.addScalar(this.moveSpeed);
                this.camera.position.add(directionMove);
                //console.log(this.camera.mvMatrix.m,this.camera.position.m);
                //this.camera.lookAt([directionMove.x+target.x,this.height+target.y,directionMove.z+config.m*10]);
            }
            
            /*if (movementY) {
                this.camera.rotation.x -= movementY * this.speedRotation;
                //this.camera.rotation.set(target)
                //console.log(movementY);
                movementY = 0;
            }*/
            if (movementX) {
                this.camera.strictAxisRotate = [0,1,0];
                this.camera.rotation.y -= movementX * this.speedRotation;
                this.camera.strictAxisRotate = false;
                //this.pitchObject.rotation.x = Math.max( -PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );
                movementX = 0;
            }
            //this.camera.rotate(0.01,[0,1,0]);
            //this.camera.lookAt([0, 1, 0]);
            //this.camera.lookAt([0, 1, 0]);
            //this.camera.rotate(0.01,[0,1,0]);
            //console.log(target.m);
            //this.camera.lookAt([target.x,this.height+target.y,this.camera.position.z+10]);
        }
    }
});

export {_control}