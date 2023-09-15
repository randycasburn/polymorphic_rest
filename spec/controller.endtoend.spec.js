import axios from 'axios';
import {constants} from "http2";
import PoiymorphicOracleDBDao from "../src/dao/PoiymorphicOracleDBDao.js";
import db from '../src/utils/OracleSQLUtility.js'
import Thing from '../src/models/Thing.js';
import logger from "winston";
// Just like SLF4J
logger.add(new logger.transports.Console({
    format: logger.format.simple(),
    level: "error"
}));

const {
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP_STATUS_NO_CONTENT,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_OK,
    HTTP_STATUS_NOT_FOUND
} = constants;

const thing1 = new Thing(77777, 'Test Thing 1', 22,43);
const thing2 = new Thing(88888, 'Test Thing 2', 22,43);
const thing3 = new Thing(99999, 'Test Thing 3', 22,43);
const mockThings = [thing1, thing2, thing3];

describe("Controller End-To-End Tests:", () => {
    const baseUrl = 'http://localhost:3000';
    const thingsUrl = `${baseUrl}/things`

    let dao;
    beforeAll(()=>{
        dao = new PoiymorphicOracleDBDao();
    })
    beforeEach(async () => {
        const stmts = [
            {sql: "delete from things", params: []},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [77777, 'Test Thing 1', 22, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [88888, 'Test Thing 2', 22, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [99999, 'Test Thing 3', 22, 43]},
        ];
        await db.transaction(stmts);
    });
    afterEach(async()=>{
        let stmts = [
            {sql: "delete from things", params: []},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [0, 'Thing 0', 23, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [1, 'Thing 1', 23, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [2, 'Thing 2', 23, 43]},
            {sql:"insert into things values (:id, :name, :t_size, :weight)", params: [3, 'Thing 3', 23, 43]},
        ];
        await db.transaction(stmts);
    })

    describe('getAllThings', () => {
        it('404 at /', async () => {
            try {
                await axios.get(baseUrl)
            } catch (err) {
                expect(err.message).toContain(HTTP_STATUS_NOT_FOUND);
            }

        });
        it('succeeds at /things', async () => {
            const response = await axios.get(thingsUrl);
            expect(response.status).toBe(HTTP_STATUS_OK);
            expect(response.data).toBeTruthy();
            const actual = response.data.map(obj=>new Thing(obj.id, obj.name, obj.t_size, obj.weight));
            expect(actual).toEqual(mockThings);
        });
    });
    describe("getThingById", () => {
        it("succeeds", async () => {

            const response = await axios.get(`${thingsUrl}/77777`);
            expect(response.status).toBe(HTTP_STATUS_OK);
            const actual = new Thing(response.data.id, response.data.name, response.data.t_size, response.data.weight);
            expect(actual).toEqual(mockThings[0]);
        });

        it("fails due to an invalid ID", async () => {
            try {
                await axios.get(`${thingsUrl}/-1`);
                fail('GET with invalid ID should have failed');
            }
            catch (err) {
                expect(err.response.status).toEqual(HTTP_STATUS_BAD_REQUEST);
            }
        });
    });
    describe('addThing', () => {
        it('succeeds', async () => {
            const newRowId = mockThings.length + 1;
            const testThing = new Thing(newRowId,'Test Thing 4', 22, 43);
            const response = await axios.post(thingsUrl, testThing);

            expect(response.status).toBe(HTTP_STATUS_OK);
            expect(response.data.rowCount).toEqual(1);
            const rows = await dao.getAllThings("things");
            expect(rows.length).toEqual(mockThings.length + 1);
        });
        it("fails due to an invalid request body", async () => {
            const testThing = {};
            try {
                await axios.post(thingsUrl, testThing);
                fail('POST with incomplete thing should have failed');
            }
            catch (err) {
                expect(err.response.status).toEqual(HTTP_STATUS_BAD_REQUEST);
                const rows = await dao.getAllThings("things");
                expect(rows.length).toEqual(mockThings.length);
            }
        });
    });
    describe('updateThing', () => {
        it('update succeeds without adding a row', async () => {
            const testThing = new Thing(77777,'Updated', 22, 34);
            try {
                await axios.put(thingsUrl, testThing);
            } catch(err) {
                console.log(err.message)
            }
            const rows = await dao.getAllThings('things');
            expect(rows.length).toEqual(mockThings.length);
            const row = rows.filter(r=>r.id===testThing.id)[0];
            expect(row.name).toEqual(testThing.name);
        });
    });
    describe('deleteThing', () => {
        it('succeeds', async () => {
            const response = await axios.delete(`${thingsUrl}/77777`);
            expect(response.data).toEqual({rowCount: 1});
            const rows = await dao.getAllThings('things');
            expect(rows.length).toEqual(mockThings.length - 1);
            const falseResult = await dao.getThing(mockThings[0].id);
            expect(falseResult).toEqual(false);
        });
        it("fails due to an invalid ID", async () => {
            try {
                await axios.delete(`${baseUrl}/-1`);

                fail('DELETE with invalid ID should have failed');
            }
            catch (err) {
                expect(err.response.status).toEqual(HTTP_STATUS_NOT_FOUND);
            }
        });
    });











});
