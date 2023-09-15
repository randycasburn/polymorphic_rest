
import Super from './Super.js';
class Wings extends Super {
  type;

  constructor(id, name, type) {
    super(id, name);
    this.type = type;
  }

  get type() {
    return this.type;
  }

  set type(value) {
    this.type = value;
  }
}

export default Wings;
