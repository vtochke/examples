import {material} from '../material.js';

let basic = function () {
    material.call(this);
}

basic.prototype = Object.assign( Object.create( material.prototype ), {
    constructor: basic,
});

export {basic}