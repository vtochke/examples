import {vec3} from '../maths/vector.js';
let position = function(){
    $event.add(this);
    return new Proxy(new vec3(),{
        set (target, prop, val) {
            Reflect.set(...arguments);
            $scope.changed = true;
            $scope.mvMatrix.setPosition(target);
            return true;
        }
    })
}

export {position}