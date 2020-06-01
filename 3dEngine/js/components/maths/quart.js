let quart = function ( x, y, z, w ) {
    x = x || 0;
    y = y || 0;
    z = z || 0;
    w = ( w !== undefined ) ? w : 1;
    this.m = [ x, y, z, w ];
    
    Object.defineProperties(this,{
        _x: {
            set: v => { this.m[0] = v },
            get: () => { return this.m[0] }
        },
        _y: {
            set: v => { this.m[1] = v },
            get: () => { return this.m[1] }
        },
        _z: {
            set: v => { this.m[2] = v },
            get: () => { return this.m[2] }
        },
        _w: {
            set: v => { this.m[3] = v },
            get: () => { return this.m[3] }
        }
    });
}

Object.assign( quart.prototype, {
    set: function (vec) {
        vec = vec instanceof Array ? vec : vec.m;
        this._x = vec[0];
        this._y = vec[1];
        this._z = vec[2];
        this._w = vec[3];
        return this;
    },
    setFromAxisAngle: function ( axis, angle ) {
        axis = axis instanceof Array ? axis : axis.m;
        let halfAngle = angle / 2, s = Math.sin( halfAngle );
        this._x = axis[0] * s;
        this._y = axis[1] * s;
        this._z = axis[2] * s;
        this._w = Math.cos( halfAngle );
        return this;
    },
    multiply: function ( q ) {
        q = q instanceof Array ? q : q.m;
        let qax = this._x, qay = this._y, qaz = this._z, qaw = this._w;
        let qbx = q[0], qby = q[1], qbz = q[2], qbw = q[3];

        this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return this;
    }
});

export {quart}