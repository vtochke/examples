let $scope;
let gl;

class scene {
    constructor (s,g) {
        $scope = s;
        gl = g;
    }

    add ( obj ) {
        obj.id = $scope.renderList.length + 1;
        if (obj.material.texture) obj.name += '_texture';
        $scope.linkShaders( obj );
        let info = new Map([
            [{ size: 3 }, obj.normals],
            [{ size: 2 }, obj.textureCoords],
        ]);

        let i = 1;
        info.forEach( (value, key) => {
            if (value) {
                $scope.initBuffer( value , key.indices);
                if (obj.attrs[i]) {
                    gl.vertexAttribPointer(i, key.size, gl.FLOAT, false, 0, 0);
                    i++;
                }
            }
        });


        /**
         * @todo разобраться почему на 2000 обьектов 20 fps вместо 40-45 (gl.DYNAMIC_DRAW)
         * 
         */
        obj.draw = () => {
            /*if (obj.material.texture) {
                $scope.initBuffer( obj.textureCoords, false);
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
                obj.material.texture.update();
            }*/
            $scope.initBuffer( obj.indices, true, obj );
            $scope.initBuffer( obj.vertices, false, obj );
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            $scope.updateUniforms(obj);
            if (obj.material.wireframe) {
                gl.drawElements(gl.LINE_LOOP, obj.indices.length ,gl.UNSIGNED_SHORT,0);
            } else {
                gl.drawElements(gl.TRIANGLES, obj.indices.length ,gl.UNSIGNED_SHORT,0);
            }
            if (obj.material.reInit) {
                this.remove(obj);
                obj.material.reInit = false;
            }
        }

        $scope.renderList.push(obj);
    }

    remove(obj) {
        let l = $scope.renderList.length;
        console.log(obj);
        while (l--) {
            if ($scope.renderList[l].id == obj.id) {
                $scope.renderList.splice(l,1);
                this.add(obj);
                break;
            }
        }
    }
}

export {scene}