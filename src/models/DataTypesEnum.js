// Enum (like)
import Thing from "./Thing.js";
import Wings from "./Wings.js";

const DataTypes = {
  "things": Symbol("things"),
  "wings": Symbol("wings"),
  "number": Symbol("number"),

  getClassFromDataType: (dataType) => {
    let shape = null;
    switch (DataTypes[dataType]) {
      case DataTypes.things :
        shape = Thing;
        break;
      case DataTypes.wings :
        shape = Wings;
        break;
      default :
        shape = null
    }
    return shape;
  }
}


export default DataTypes
