import {vec2,vec3} from '../components/maths/vector.js';
import {mat2,mat3,mat4} from '../components/maths/matrix.js';
import {texture} from '../entitys/materials/texture.js';
//import {scene} from '../entitys/scene.js';

export let _ = function () {
    let gl;
    let canvas;
    let $scope;
    let lastProgram;
    const DEG2RAD = Math.PI / 180;
    let $shaders = {};
    return new class {
        constructor () {
            this.name = '_';
            canvas = document.querySelector("canvas");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight-4;
            gl = canvas.getContext("webgl2")
            if(gl){
                $scope = this;
                this.settings();
                this.clear();
                this.scene = this.sceneInit();
                this.renderList = new Set();
                this.matrixWorld = new mat4();
                //console.log(gl);
                //console.log(gl.getSupportedExtensions());
                //console.log(gl.getContextAttributes());
                this.listeners();
            }
        }

        settings () {
            this.aspect = canvas.clientWidth / canvas.clientHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
            gl.enable(gl.DEPTH_TEST);
            //gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);//не отображать заднюю часть
        }

        clear () {
            // покрасим в серый цвет фон
            gl.clearColor(0.5, 0.5, 0.5, 1.0);
            //gl.clearColor(0, 0, 0, 0); // прозрачный
            gl.clear(gl.COLOR_BUFFER_BIT);

        }

        linkShaders ( object ) {

            let shader = $shaders[object.material.name]; 
            if (shader) {
                // Нужно сделать чтобы шейдеры одного типа, например box не инициализировались по несколько раз
                object.sP = shader.program;
                object.attrs = shader.attrs;
                object.uniforms = shader.uniforms;
                return;
            } else {
                $shaders[object.material.name] = {
                    program: {},
                    attrs: [],
                    uniforms: [],
                };
            }
            
            let data = {
                'VERTEX_SHADER' : object.material.vs,
                'FRAGMENT_SHADER' : object.material.fs,
            };
            
            let shaderProgram = gl.createProgram();

            for (let type in data) {
                data[type] = this.preCompileSahder( object, data[type] );
                shader = gl.createShader( gl[type] );
                gl.shaderSource(shader, data[type] );
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.log("Ошибка компиляции шейдера: " + gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return false;
                }
                gl.attachShader(shaderProgram, shader);
                gl.deleteShader( shader );
            }
            
            gl.linkProgram(shaderProgram);
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) console.log("Не удалось установить шейдеры");
            
            $shaders[object.material.name].program = object.sP = shaderProgram;

            this.enableAttributes( object );
            this.enableUniforms( object );
            
        }
        
        preCompileSahder ( object, textShader = '') {
            let r;
            textShader = textShader.replace(/#include +<([\w\d./]+)>/gim,(match, inc)=>{
                r = typeof(object.material[inc]) == 'object' ? 1 : object.material[inc];
                return object.material[inc] ? `#define ${inc.toUpperCase()} ${r}` : '';
            });
            //console.log(textShader);
            return textShader;
        }
        
        enableAttributes( object ){
            let n = gl.getProgramParameter( object.sP, gl.ACTIVE_ATTRIBUTES );
            let info,attr;
            object.attrs = [];
            for ( let i = 0; i < n; i ++ ) {
                info = gl.getActiveAttrib( object.sP, i );
                object.attrs[info.name] = info;
            }
            $shaders[object.material.name].attrs = object.attrs;
        }
        enableUniforms( object ){
            let info,uniform,uniformAr,matrix,type;
            let n = gl.getProgramParameter( object.sP, gl.ACTIVE_UNIFORMS );
            object.uniforms = [];
            for ( let i = 0; i < n; i ++ ) {
                info = gl.getActiveUniform( object.sP, i );
                if (info.type == gl.SAMPLER_2D) continue;
                uniform = gl.getUniformLocation( object.sP, info.name);
                uniformAr = gl.getUniform( object.sP, uniform );
                uniformAr = Math.sqrt(uniformAr.length) || 0;
                switch (uniformAr) {
                    case 4: 
                        matrix = new mat4();
                        type = 'uniformMatrix4fv';
                    break;
                    case 3: 
                        matrix = new mat3();
                        type = 'uniformMatrix3fv';
                    break;
                    case 2: 
                        matrix = new mat2();
                        type = 'uniformMatrix2fv';
                    break;
                    default: 
                        matrix = new vec3();
                        type = 'uniform3fv';
                }
                object.uniforms[info.name] = { matrix: matrix, uniform: uniform, type:  type};
            }
            $shaders[object.material.name].uniforms = object.uniforms;
        }              

        initBuffer (obj = {}) {
            obj.vao = gl.createVertexArray();
            gl.bindVertexArray(obj.vao);
            
            let bindBuffer = (opts = {}, key = '') => {
                // установка буфера вершин
                let data = opts.material ? obj.material[key] : obj[key];
                if (key == 'indices') {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.DYNAMIC_DRAW);
                } else {
                    //gl.STATIC_DRAW
                    //gl.DYNAMIC_DRAW
                    //gl.STREAM_DRAW
                    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
                }
            }

            let info = {    
                vertices: { size: 3 },
                normals: { size: 3 },
                indices: {},
            };
            if (obj.material.texture) info.textureCoords = { size: 2 };
            else if (obj.material.instanced) info.colors = { size: 3, material : true };
            
            let i = 0,opts,name;
            
            for (let key in info) {
                opts = info[key];
                if (obj[key] || (opts.material && obj.material[key])) {
                    name = 'a_'+key;
                    bindBuffer(opts, key);
                    if (obj.attrs[name]) {
                        gl.bindAttribLocation(obj.sP,i,name);
                        gl.enableVertexAttribArray(i);
                        gl.vertexAttribPointer(i, opts.size, gl.FLOAT, false, 0, 0);
                        i++;
                    }
                }
            }
            
            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        
        updateView (camera) {
            if (camera.changed) {
                this.matrixWorld.multiply(camera.pMatrix,camera.mvMatrix);
                camera.changed = false;
            }
            return this;
        }

        setupLights() {
            this.uniforms['uLightPosition'].matrix.set([0.0, 10.0, 5.0]);
            this.uniforms['uAmbientLightColor'].matrix.set([0.1, 0.1, 0.1]);
            this.uniforms['uDiffuseLightColor'].matrix.set([0.7, 0.7, 0.7]);
            this.uniforms['uSpecularLightColor'].matrix.set([1.0, 1.0, 1.0]);
        }

        updateUniforms( object ){
            object.uniforms['uPMatrix'].matrix = this.matrixWorld; // передать обьекту проекцию от камеры
            object.uniforms['uMVMatrix'].matrix = object.mvMatrix;
            
            /**
             * @todo обновление параметров, подумать как меньше обновлять юниформы
             */
            if (object.uniforms['uDiffuseMaterialColor']) {
                object.uniforms['uDiffuseMaterialColor'].matrix.set(object.material.color);
            }
            if (object.uniforms['uNMatrix']) object.uniforms['uNMatrix'].matrix.normalFromMat4(object.uniforms['uMVMatrix'].matrix);
            
            let u;
            if (lastProgram != object.sP) {
                gl.useProgram(object.sP);
                lastProgram = object.sP;
            }
            for (let i in object.uniforms) {
                u = object.uniforms[i];
                if (u.type == "uniform3fv") gl[u.type](u.uniform,u.matrix.m);
                else gl[u.type](u.uniform,false,u.matrix.m);
            }

        }

        draw ( camera ) {
            this.updateView(camera);
            this.clear();
            this.renderList.forEach( (id, o) => {
                o.draw();
            });
        }

        texture( src = ''){
            return new texture(src,gl);
        }

        sceneInit () {
            return new class {
                constructor () {
                    
                }

                add ( obj ) {
                    if (obj.material.texture) {
                        obj.material.name += '_texture';
                        obj.material.reInit = false;
                    }
                    if (obj.material.instanced) {
                        obj.material.name += '_instanced';
                    }
                    
                    $scope.linkShaders( obj );
                    $scope.initBuffer(obj);
                    
                    /**
                     * @todo разобраться почему на 2000 обьектов 20 fps вместо 40-45 (gl.DYNAMIC_DRAW)
                     * 
                     */
                    obj.draw = () => {
                        if (obj.material.reInit) {
                            this.remove(obj);
                            this.add(obj);
                            return;
                        }
                        if (obj.material.texture) obj.material.texture.update();
                        gl.bindVertexArray(obj.vao);
                        $scope.updateUniforms(obj);
                        if (obj.material.wireframe) {
                            gl.drawElements(gl.LINE_LOOP, obj.indices.length ,gl.UNSIGNED_SHORT,0);
                        } else {
                            gl.drawElements(gl.TRIANGLES, obj.indices.length ,gl.UNSIGNED_SHORT,0);
                        }
                    }

                    $scope.renderList.add(obj);
                }
                
                remove(obj) {
                    $scope.renderList.delete(obj);
                }
            }
        }
                
        listeners(){
            // событие изменения окна браузера
            window.addEventListener('resize',() => {
                var width = gl.canvas.clientWidth;
                var height = gl.canvas.clientHeight;
                if (gl.canvas.width != width || gl.canvas.height != height) {
                    gl.canvas.width = width;
                    gl.canvas.height = height;
                }
                this.settings();
            });
        }
        
    }
}();
