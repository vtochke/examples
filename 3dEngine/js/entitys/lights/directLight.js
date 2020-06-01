import {light} from './light.js';

let directLight = function(position = []){
    return new class extends light {
        constructor(){
            super();
        }
        
        get vs(){
            return `#version 300 es
            layout(location = 0) in vec3 aVertexPosition;
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;
            
            uniform vec3 uLightPosition;
            uniform vec3 uAmbientLightColor;
            uniform vec3 uDiffuseLightColor;
            uniform vec3 uSpecularLightColor;
            const float shininess = 16.0;
            `;
        }
        
        get fs(){
            return ``;
        }
    }
}

export {directLight}


