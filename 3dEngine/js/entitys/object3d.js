import {mat4} from '../components/maths/matrix.js';
import {vec3} from '../components/maths/vector.js';
import {_maths} from '../components/maths/_maths.js';
import {position} from '../components/object3d/position.js';

let axis = ['x','y','z'];

let object3d = function(){
    this.mvMatrix = new mat4();
    this.pMatrix = new mat4();
    this.name = this.__proto__.constructor.name;
    this.changed = false;
    this.guid = _maths.generateUUID();
    this.childs = new Set();
    
    let $scope = this;
    
    //this.position = new position();
    this.position = new Proxy(new vec3(),{
        set (target, prop, val) {
            Reflect.set(...arguments);
            $scope.changed = true;
            $scope.mvMatrix.setPosition(target);
            return true;
        }
    });
    this.rotation = new Proxy(new vec3(),{
        set (target, prop, val) {
            let deltaRotate = val-target[prop];
            Reflect.set(...arguments);
            $scope.changed = true;
            if ($scope.strictAxisRotate) {
                $scope.mvMatrix.rotate(deltaRotate,$scope.strictAxisRotate);
            } else {
                $scope.mvMatrix.rotate(deltaRotate,target);
            }
            return true;
        }
    });
}

Object.assign( object3d.prototype, {
    translate: function (vec) {
        this.position.add(vec);
        return this;
    },
    rotate: function (rad = 0,vec) {
        for (var i in axis) if (vec[i]) this.rotation[axis[i]] += rad;
        return this;
    },
    lookAt: function (vec) {
        this.mvMatrix.lookAt(this.position,vec);
        this.changed = true;
        return this;
    },
    add: function (o = {}){
        this.childs.add(o);
    },
    remove: function (o = {}){
        this.childs.delete(o);
    }
});

export {object3d}