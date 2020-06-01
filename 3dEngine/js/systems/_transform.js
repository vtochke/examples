export let _transform = function(){
    return new class {
        constructor () {
            
        }
        update () {
            if ($event.position) {
                for (let v of $event.position) {
                    $event.position.delete(v);
                }
            }
        }
    }
}();