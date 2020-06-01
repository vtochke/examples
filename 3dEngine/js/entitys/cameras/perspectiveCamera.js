import {object3d} from '../object3d.js';

let perspectiveCamera = function (fov = 40, near = 0.1 , far = 1000, aspect = 1) {
    object3d.apply(this);
    this.pMatrix.perspective(fov, aspect, near, far);
    this.changed = true;
}

perspectiveCamera.prototype = Object.assign( Object.create( object3d.prototype ), {
    constructor: perspectiveCamera,
});

export {perspectiveCamera}