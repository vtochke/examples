import {quart} from './quart.js';
let mat4 = function () {
    this.m = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
}

/**
 * // C++
    struct Mat4x4 {
      Vec4 x_axis;
      Vec4 y_axis;
      Vec4 z_axis;
      Vec4 translation;
    }
 * [
 *   [scaleX,scaleY,scaleZ,ClipX],
 *   [?,scaleZ,?,?],
 *   [scaleX,scaleY,scaleZ,ClipZ],
 *   [posX,posY,posZ,ClipY]
 * ]
 *
 */

Object.assign( mat4.prototype, {
    perspective: function ( fov, aspect, near, far ) {
        let f = 1.0 / Math.tan(fov / 2), 
            nf = 1 / (near - far),
            a = f / aspect,
            b = (far + near) * nf,
            c = (2 * far * near) * nf;
        this.m = [
            a,0,0,0,
            0,f,0,0,
            0,0,b,-1,
            0,0,c,0
        ];
        return this;
    },
    translate: function (v) {
        v = v instanceof Array ? v : v.m;
        let m = this.m,
            x = v[0], y = v[1], z = v[2];
        m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
        m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
        m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
        m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
        return this;
    },
    setPosition: function(v){
        v = v instanceof Array ? v : v.m;
        let m = this.m;
        m[12] = v[0];
        m[13] = v[1];
        m[14] = v[2];
        return this;
    },
    /*setRotation: function(rad,axis){
        axis = axis instanceof Array ? axis : axis.m;
        let m = this.m;
        let x = Math.abs(axis[0]), y = Math.abs(axis[1]), z = Math.abs(axis[2]),
            len = 1 / Math.hypot(x,y,z),
            s = Math.sin(rad),
            c = Math.cos(rad),
            t = 1 - c;
        x *= len; y *= len; z *= len;
        let tx = t * x, ty = t * y;
        
        let b00 = tx * x + c, b01 = tx * y + z * s, b02 = tx * z + y * s,
            b10 = tx * y + z * s, b11 = ty * y + c, b12 = ty * z - x * s,
            b20 = tx * z - y * s, b21 = ty * z + x * s, b22 = z * z * t + c;
            
        m[0] = b00;
        m[1] = b01;
        m[2] = b02;
        
        m[4] = b10;
        m[5] = b11;
        m[6] = b12;

        m[8] = b20;
        m[9] = b21;
        m[10] = b22;        
    },*/
    setScale: function ( v ) {
        v = v instanceof Array ? v : v.m;
        let m = this.m;

        m[ 0 ] *= v[0]; m[ 4 ] *= v[1]; m[ 8 ] *= v[2];
        m[ 1 ] *= v[0]; m[ 5 ] *= v[1]; m[ 9 ] *= v[2];
        m[ 2 ] *= v[0]; m[ 6 ] *= v[1]; m[ 10 ] *= v[2];
        m[ 3 ] *= v[0]; m[ 7 ] *= v[1]; m[ 11 ] *= v[2];

        return this;

    },
    rotate: function (rad, axis) {
        axis = axis instanceof Array ? axis : axis.m;
        let m = this.m;
        let x = Math.abs(axis[0]), y = Math.abs(axis[1]), z = Math.abs(axis[2]),
            len = 1 / Math.hypot(x,y,z),
            s = Math.sin(rad),
            c = Math.cos(rad),
            t = 1 - c;
        x *= len; y *= len; z *= len;
        let a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3],
            a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
            a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
        let tx = t * x, ty = t * y;
        
        let b00 = tx * x + c, b01 = tx * y - z * s, b02 = tx * z + y * s,
            b10 = tx * y + z * s, b11 = ty * y + c, b12 = ty * z - x * s,
            b20 = tx * z - y * s, b21 = ty * z + x * s, b22 = z * z * t + c;
    
        m[0] = a00 * b00 + a10 * b01 + a20 * b02;
        m[1] = a01 * b00 + a11 * b01 + a21 * b02;
        m[2] = a02 * b00 + a12 * b01 + a22 * b02;
        m[3] = a03 * b00 + a13 * b01 + a23 * b02;
        m[4] = a00 * b10 + a10 * b11 + a20 * b12;
        m[5] = a01 * b10 + a11 * b11 + a21 * b12;
        m[6] = a02 * b10 + a12 * b11 + a22 * b12;
        m[7] = a03 * b10 + a13 * b11 + a23 * b12;
        m[8] = a00 * b20 + a10 * b21 + a20 * b22;
        m[9] = a01 * b20 + a11 * b21 + a21 * b22;
        m[10] = a02 * b20 + a12 * b21 + a22 * b22;
        m[11] = a03 * b20 + a13 * b21 + a23 * b22;
        return this;
    },
    //this.quaternion.setFromAxisAngle( axis, angle );
    /*makeRotationFromQuaternion: function ( q ) {
        	var _zero = new Vector3( 0, 0, 0 );
            var _one = new Vector3( 1, 1, 1 );
        return this.compose( _zero, q, _one );
    },
    rotateOnAxis: function ( axis, angle ) {

        // rotate object on axis in object space
        // axis is assumed to be normalized
        var _q1 = new quart();
        _q1.setFromAxisAngle( axis, angle );

        this.quaternion.multiply( _q1 );

        return this;

    },

    rotateZ: function ( angle ) {

        return this.rotateOnAxis( _zAxis, angle );

    },
    compose: function ( position, quaternion, scale ) {

			var te = this.elements;

			var x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
			var x2 = x + x,	y2 = y + y, z2 = z + z;
			var xx = x * x2, xy = x * y2, xz = x * z2;
			var yy = y * y2, yz = y * z2, zz = z * z2;
			var wx = w * x2, wy = w * y2, wz = w * z2;

			var sx = scale.x, sy = scale.y, sz = scale.z;

			te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
			te[ 1 ] = ( xy + wz ) * sx;
			te[ 2 ] = ( xz - wy ) * sx;
			te[ 3 ] = 0;

			te[ 4 ] = ( xy - wz ) * sy;
			te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
			te[ 6 ] = ( yz + wx ) * sy;
			te[ 7 ] = 0;

			te[ 8 ] = ( xz + wy ) * sz;
			te[ 9 ] = ( yz - wx ) * sz;
			te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
			te[ 11 ] = 0;

			te[ 12 ] = position.x;
			te[ 13 ] = position.y;
			te[ 14 ] = position.z;
			te[ 15 ] = 1;

			return this;

		},*/
    multiply: function (a, b) {
        let m = this.m;
        if (!b) {
            b = a;
            a = m;
        }
        a = a['m'] ? a['m'] : a;
        b = b['m'] ? b['m'] : b;

        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        // Cache only the current line of the second matrix
        let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        m[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        m[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        m[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        m[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        m[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        m[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        m[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
        return this;
    },

    lookAt: function (pos, center, up) {
        pos = pos instanceof Array ? pos : pos.m;
        center = center instanceof Array ? center : center.m;
        let m = this.m;
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        up = up || [0,1,0];
        let upx = up[0];
        let upy = up[1];
        let upz = up[2];

        z0 = pos[0] - center[0];
        z1 = pos[1] - center[1];
        z2 = pos[2] - center[2];

        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);
        if (!len) {
          x0 = 0;
          x1 = 0;
          x2 = 0;
        } else {
          len = 1 / len;
          x0 *= len;
          x1 *= len;
          x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.hypot(y0, y1, y2);
        if (!len) {
          y0 = 0;
          y1 = 0;
          y2 = 0;
        } else {
          len = 1 / len;
          y0 *= len;
          y1 *= len;
          y2 *= len;
        }

        m[0] = x0;
        m[1] = y0;
        m[2] = z0;
        m[3] = 0;
        m[4] = x1;
        m[5] = y1;
        m[6] = z1;
        m[7] = 0;
        m[8] = x2;
        m[9] = y2;
        m[10] = z2;
        m[11] = 0;
        m[12] = -(x0 * pos[0] + x1 * pos[1] + x2 * pos[2]);
        m[13] = -(y0 * pos[0] + y1 * pos[1] + y2 * pos[2]);
        m[14] = -(z0 * pos[0] + z1 * pos[1] + z2 * pos[2]);
        m[15] = 1;

        return this;
    },
});

let mat3 = function () {
    this.m = [
        1,0,0,
        0,1,0,
        0,0,1
    ];
}

Object.assign( mat3.prototype, {
    
    //Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
    normalFromMat4: function (a) {
        a = a['m'] ? a['m'] : a;
        let m = [];
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32; // Calculate the determinant

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;

        det = 1.0 / det;

        m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        m[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        m[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        m[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        m[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        m[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        m[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        m[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        m[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        this.m = m;
    }
});

let mat2 = function () {
    this.m = [
        1,0,
        0,1
    ];
}

export {mat2,mat3,mat4}