import Thing from "../src/models/Thing.js";
import logger from "winston";
// Just like SLF4J
logger.add(new logger.transports.Console({
    format: logger.format.simple(),
    level: "error"
}));

describe('thing constructor', () => {
    it('succeeds when all constructor args are valid', () => {
        const thing = new Thing(1, 'A thing');
        expect(thing.id).toBe(1);
        expect(thing.name).toBe('A thing');
    });
});
