export let event = function(){
    return new class {
        constructor () {
            
        }
        add (obj){
            let name = obj.__proto__.constructor.name;
            if (!this[name]) this[name] = new Set();
            this[name].add(obj);
        }
        remove (obj){
            let name = obj.__proto__.constructor.name;
            this[name].delete(obj);
        }
    }
}();

window.$event = event;