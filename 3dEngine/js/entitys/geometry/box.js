import {vec2,vec3} from '../../components/maths/vector.js';
import {mat2,mat3,mat4} from '../../components/maths/matrix.js';
import {geometry} from './geometry.js';

function buildPlane ( u, v, w, udir, vdir, width, height, depth, gridX, gridY, numberOfVertices) {
    let segmentWidth = width / gridX,
        segmentHeight = height / gridY,
        widthHalf = width / 2,
        heightHalf = height / 2,
        depthHalf = depth / 2,
        gridX1 = gridX + 1,
        gridY1 = gridY + 1;
        
    let x, y, ix, iy, a, b, c, d,
        vector = new vec3(),
        vertices = [],
        normals = [],
        uvs = [],
        indices = [],
        vertexCounter = 0;

    for ( iy = 0; iy < gridY1; iy ++ ) {
        y = iy * segmentHeight - heightHalf;
        for ( ix = 0; ix < gridX1; ix ++ ) {
            x = ix * segmentWidth - widthHalf;
            vector[ u ] = x * udir;
            vector[ v ] = y * vdir;
            vector[ w ] = depthHalf;
            vertices.push( vector.x, vector.y, vector.z );
            vector[ u ] = 0;
            vector[ v ] = 0;
            vector[ w ] = depth > 0 ? 1 : - 1;
            normals.push( vector.x, vector.y, vector.z );
            uvs.push( ix / gridX );
            uvs.push( 1 - ( iy / gridY ) );
            vertexCounter += 1;
        }
    }

    for ( iy = 0; iy < gridY; iy ++ ) {
        for ( ix = 0; ix < gridX; ix ++ ) {
            a = numberOfVertices + ix + gridX1 * iy;
            b = numberOfVertices + ix + gridX1 * ( iy + 1 );
            c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
            d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;
            indices.push( a, b, d );
            indices.push( b, c, d );
        }
    }

    return {
        vertices,
        normals,
        indices,
        uvs,
        vertexCounter
    };
}


let box = function (width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
    geometry.call( this );
    
    this.attachPlane(
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, this.numberOfVertices)
    ); // py
    
    if (!this.side) {
        this.attachPlane(
            buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, this.numberOfVertices)
        ); // px
        this.attachPlane(
            buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, this.numberOfVertices)
        ); // nx
        this.attachPlane(
            buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, this.numberOfVertices)
        ); // ny
        this.attachPlane(
            buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, this.numberOfVertices)
        ); // pz
        this.attachPlane(
            buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, this.numberOfVertices)
        ); // nz
    }
    this.setTextureCoords();
    this.needUpdate = true;
}

box.prototype = Object.assign( Object.create( geometry.prototype ), {
    constructor: box,
    
    attachPlane: function (data = {}) {
        let ar = [
            'vertices','normals','indices','uvs'
        ];
        for (let o of ar) this[o] = [...this[o],...data[o]];
        this.numberOfVertices += data.vertexCounter;
    },
    
    setTextureCoords: function(){
        for (let i=0; i<6; i++) {
            this.textureCoords.push(1, 1, 0, 1, 1, 0, 0, 0);
        }
    },    
});

let plane = function (width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
    this.side = 1;
    box.apply(this,[width,0,height,widthSegments,heightSegments,1]);
}

plane.prototype = Object.assign( Object.create( box.prototype ), {
    constructor: box,
});

export {box,plane}