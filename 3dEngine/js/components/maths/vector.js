/*let vec3 = function() {
    let identity = [0,0,0];
    
    return new class {
        constructor () {
            this.m = identity;
            this.x = this.y = this.z = 0;
        }
        set (ar = []) {
            this.m = ar;
            this.x = ar[0];
            this.y = ar[1];
            this.z = ar[2];
            return this;
        }
    }
}
*/

let vec3 = function ( x, y, z ) {
    x = x || 0;
    y = y || 0;
    z = z || 0;
    this.m = [ x, y, z ];
    
    Object.defineProperties(this,{
        x: {
            set: v => { this.m[0] = v },
            get: () => { return this.m[0] }
        },
        y: {
            set: v => { this.m[1] = v },
            get: () => { return this.m[1] }
        },
        z: {
            set: v => { this.m[2] = v },
            get: () => { return this.m[2] }
        }
    });    
}
Object.assign( vec3.prototype, {
    set: function (vec) {
        vec = vec instanceof Array ? vec : vec.m;
        this.x = vec[0];
        this.y = vec[1];
        this.z = vec[2];
        return this;
    },
    add: function(vec){
        vec = vec instanceof Array ? vec : vec.m;
        this.x += vec[0];
        this.y += vec[1];
        this.z += vec[2];
    },
    addScalar: function(number){
        this.x *= number;
        this.y *= number;
        this.z *= number;
    },
    identity: function (){
        this.x = 0;
        this.y = 0 ;
        this.z = 0;
    }
});

let vec2 = function ( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
    this.m = [this.x,this.y];
}
Object.assign( vec2.prototype, {
    set: function (ar = []) {
        this.m = ar;
        this.x = ar[0];
        this.y = ar[1];
        return this;
    }
});

export {vec2,vec3}