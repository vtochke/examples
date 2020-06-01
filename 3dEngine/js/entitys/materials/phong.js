let phong = function (){
    
    return new class {
        constructor(){
            
        }
        get vs () {
            return `#version 300 es
            layout(location = 0) in vec3 aVertexPosition;
            //layout(location = 1) in vec3 aVertexColor;
            //layout(location = 2) in vec3 aVertexNormal;
            //layout(location = 3) in vec2 aVertexTextureCoords;

            //out vec4 vColor;
            //out vec2 vTextureCoords;
            //out vec3 vLightWeighting;

            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;
            //uniform mat3 uNMatrix;

            //uniform vec3 uLightPosition;
            //uniform vec3 uAmbientLightColor;
            //uniform vec3 uDiffuseLightColor;
            //uniform vec3 uSpecularLightColor;

            //const float shininess = 16.0;

            void main(void) {

                //vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
                //vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

                // получаем вектор направления света
                //vec3 lightDirection = normalize(uLightPosition - vertexPositionEye3);

                // получаем нормаль
                //vec3 normal = normalize(uNMatrix * aVertexNormal);

                // получаем скалярное произведение векторов нормали и направления света
                //float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

                // получаем вектор отраженного луча и нормализуем его
                //vec3 reflectionVector = normalize(reflect(-lightDirection, normal));

                // установка вектора камеры
                //vec3 viewVectorEye = -normalize(vertexPositionEye3);

                //float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);

                //float specularLightParam = pow(specularLightDot, shininess);

                // отраженный свет равен сумме фонового, диффузного и зеркального отражений света
                //vLightWeighting = uAmbientLightColor + uDiffuseLightColor * diffuseLightDot +
                //                  uSpecularLightColor * specularLightParam;

                gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
                //vTextureCoords = aVertexTextureCoords;
                //vColor = vec4(aVertexColor, 1.0);
            }`;
        }
        
        get fs(){
            return `#version 300 es
            precision mediump float;
            //in vec4 vColor;
            //in vec2 vTextureCoords;
            //in vec3 vLightWeighting;
            //uniform sampler2D uSampler;

            out vec4 fragColor;
            void main(void) {
                fragColor = vec4(1.0,1.0,1.0,1.0);
                //fragColor = texture(uSampler, vTextureCoords);
                //vec4 texelColor = texture(uSampler, vTextureCoords);
                //fragColor = vec4(vLightWeighting.rgb * texelColor.rgb, texelColor.a);
            }`;
        }
        
    }
}

