import {object3d} from '../object3d.js';
import {basic} from '../materials/basic.js';
let geometry = function(){
    object3d.call(this);
    this.uvs = [];
    this.numberOfVertices = 0;
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.textureCoords = [];
    this.material = new basic();
}

geometry.prototype = Object.assign( Object.create( object3d.prototype ), {
    constructor: geometry,
    setMaterial (options) {
        Object.assign(this.material,options)
    }
});

export {geometry}

