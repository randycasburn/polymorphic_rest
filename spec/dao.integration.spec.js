import db from '../src/utils/OracleSQLUtility.js'
import Thing from "../src/models/Thing.js";
import PoiymorphicOracleDBDao from "../src/dao/PoiymorphicOracleDBDao.js";
import logger from "winston";

const thing1 = new Thing(77777, 'Test Thing 1', 23, 43);
const thing2 = new Thing(88888, 'Test Thing 2', 23, 43);
const thing3 = new Thing(99999, 'Test Thing 3', 23, 43);
const mockThings = [thing1, thing2, thing3];
// Just like SLF4J
logger.add(new logger.transports.Console({
    format: logger.format.simple()
}));

describe('Thing DAO integration tests:', () => {
    let dao;
    beforeAll(()=>{
        dao = new PoiymorphicOracleDBDao();
    })
    beforeEach(async () => {
        const stmts = [
            {sql: "delete from things", params: []},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [77777, 'Test Thing 1', 23, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [88888, 'Test Thing 2', 23, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [99999, 'Test Thing 3', 23, 43]},
        ];
        await db.transaction(stmts);
    });
    afterEach(async()=>{
        const stmts = [
            {sql: "delete from things", params: []},
            {sql: "delete from things where id = :id", params: [77777]},
            {sql: "delete from things where id = :id", params: [88888]},
            {sql: "delete from things where id = :id", params: [99999]}
        ]
        await db.transaction(stmts);
    })


    describe('getAllThings',  () => {
        it('succeeds', async () => {
            const allThings = await dao.getAllThings('things');
            expect(allThings.length).toEqual(mockThings.length);
            expect(allThings).toEqual(mockThings);
        });
    });

    describe('getThingById', () => {
        it('succeeds', async () => {
            const thing = await dao.getThing('things',77777);
            expect(thing).toEqual(thing1);
        });
    });

    describe('addThing', () => {
        it('succeeds', async () => {
            const newRowId = mockThings.length + 1;
            const testThing = new Thing(newRowId,'Test Thing 4', 22,33);
            let affectedRows = await dao.addThing('things', testThing);

            expect(affectedRows).toEqual({rowCount: 1});
            const newRowCount = await dao.getAllThings('things');
            expect(newRowCount.length).toEqual(mockThings.length + 1);
            affectedRows = await dao.getThing(newRowId);
            expect(affectedRows).toEqual(false);
        });
    });

    describe('updateThing', () => {
        it('succeeds', async () => {
            const testThing = new Thing(77777,'Updated', 23, 23);
            const affectedRows = await dao.updateThing('things', testThing);
            expect(affectedRows).toEqual({rowCount: 1});
            const newRowCount = await dao.getAllThings('things')
            expect(newRowCount.length).toEqual(mockThings.length);
        });
    });

    describe('deleteThing', () => {
        it('succeeds', async () => {
            const deletedCount = await dao.deleteThing('things', 77777);
            expect(deletedCount).toEqual({rowCount: 1});
            const newRowCount = await dao.getAllThings('things');
            expect(newRowCount.length).toEqual(mockThings.length - 1);
            const zeroRecords = await dao.getThing('things', mockThings[0].id);
            expect(zeroRecords).toEqual(false);
        });
    });
});
