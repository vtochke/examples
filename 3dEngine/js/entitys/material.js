let material = function ( options = {}) {
    this.color = [Math.random(),Math.random(),Math.random()];
    this.wireframe = false;
    this.name = this.__proto__.constructor.name;
    
    Object.defineProperty(this,'texture',{
        set: function($tex){
            this._texture = $tex;
            this.reInit = true;
            return $tex;
        },
        get: function(){
            return this._texture;
        }
    });
}

Object.assign( material.prototype, {
    get vs () {
        return `#version 300 es
        in vec3 a_vertices;
        in vec3 a_normals;
        #include <texture>
        #include <instanced>

        #ifdef TEXTURE
            in vec2 a_textureCoords;
            out vec2 vTextureCoords;
        #else
            //uniform vec3 uDiffuseLightColor;
            #ifdef INSTANCED
                in vec3 a_colors;
            #else
                uniform vec3 uDiffuseMaterialColor;
            #endif
        #endif

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        //uniform vec3 uAmbientMaterialColor;
        //uniform vec3 uSpecularMaterialColor;

        out vec3 vLightWeighting;

        /*struct light {
            float intensity;
            vec3 pos;
        }
        lightVar = light(3.0, vec3(1.0, 2.0, 3.0));*/

        void main(void) {
            vec3 normal = normalize(uNMatrix * a_normals);

            #ifdef TEXTURE
                vTextureCoords = a_textureCoords;
                vLightWeighting = normal;
            #else
                #ifdef INSTANCED
                    //vLightWeighting = a_colors * uDiffuseLightColor;
                    vLightWeighting = a_colors;
                #else
                    //vLightWeighting = uDiffuseMaterialColor * uDiffuseLightColor;
                    vLightWeighting = uDiffuseMaterialColor;
                #endif
            #endif

            gl_Position = uPMatrix * uMVMatrix * vec4(a_vertices, 1.0);
        }`;
    },

    get fs () {
        return `#version 300 es
        precision mediump float;
        #include <texture>

        #ifdef TEXTURE
            in vec2 vTextureCoords;
            uniform sampler2D uSampler;
        #else

        #endif

        in vec3 vLightWeighting;

        out vec4 fragColor;
        void main(void) {
            #ifdef TEXTURE
                vec4 texelColor = texture(uSampler, vTextureCoords);
                fragColor = texelColor;
                //fragColor = vec4(vLightWeighting.rgb * texelColor.rgb, texelColor.a);
            #else
                fragColor = vec4(vLightWeighting.rgb, 1.0);
            #endif
        }`;
    },
});




export {material}