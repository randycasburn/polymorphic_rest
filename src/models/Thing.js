import Super from './Super.js';

class Thing extends Super {
    t_size;
    weight;
    constructor(id = -1, name = '', weight, height) {
        super(id, name);
        this.t_size = 22;
        this.weight = 32;
    }


    getId() {
        return this.id;
    }

    setId(value) {
        this.id = value;
    }

    getName() {
        return this.name;
    }

    setName(value) {
        this.name = value;
    }

    getT_size() {
        return this.t_size;
    }

    setSize(value) {
        this.size = value;
    }

    getWeight() {
        return this.weight;
    }

    setWeight(value) {
        this.weight = value;
    }

    toString(){
        return `${this.getId()} || ${this.getName()}`;
    }
}

export default Thing;
