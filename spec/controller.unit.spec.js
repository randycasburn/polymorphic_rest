import controller from '../src/controllers/PolymorphicController.js'
import Thing from "../src/models/Thing.js";
import {constants} from 'http2';
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

const thing1 = new Thing(1, 'Test Thing 1', 23, 34);
const thing2 = new Thing(2, 'Test Thing 2', 23, 34);
const thing3 = new Thing(3, 'Test Thing 3', 23, 34);
const mockThings = [thing1, thing2, thing3];

describe('Controller Unit (mocked) Tests', () => {
    let mockDao;
    let mockHttpResponse;

    beforeEach(()=> {
        mockDao = jasmine.createSpyObj('mockDao',
          ['getAllThings', 'getThing', 'addThing',
              'updateThing', 'deleteThing']);

        controller.dao = mockDao;
        mockHttpResponse = jasmine.createSpyObj('mockHttpResponse', ['status', 'json', 'send']);
        // The mock status() method needs to return a reference to the
        // mock response so it can be chained with other calls:
        //    res.status(500).json(...)
        mockHttpResponse.status.and.returnValue(mockHttpResponse);
    });

    describe('getAllThings', () => {
        it('succeeds', async () => {
            mockDao.getAllThings.and.resolveTo(mockThings);
            const req = { params: {dataType: "things"}};

            await controller.getAllThings(req, mockHttpResponse);

            expect(mockHttpResponse.json).toHaveBeenCalledOnceWith(mockThings);
        });

        // it('fails due to an exception', async () => {
        //     mockDao.getAllThings.and.throwError('test rejection');
        //     const req = { params: {dataType: "dddd"}};
        //
        //     //await controller.getAllThings(req, mockHttpResponse);
        //     expect(await controller.getAllThings(req, mockHttpResponse)).toThrow('test rejection')
        //     //expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_BAD_REQUEST);
        // });
    });

    describe('getThingById', () => {
        it('succeeds', async () => {
            mockDao.getThing.and.resolveTo(mockThings[0]);
            const req = { params: { id: 1 } };

            await controller.getThingById(req, mockHttpResponse);

            expect(mockHttpResponse.json).toHaveBeenCalledOnceWith(mockThings[0]);
        });

        it('returns not found (404)', async () => {
            mockDao.getThing.and.resolveTo(false);
            const req = { params: { id: 0 } };

            await controller.getThingById(req, mockHttpResponse);

            expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_NOT_FOUND);
        });
        it('fails due to an invalid ID', async () => {
            const req = { params: { id: -1 } };

            await controller.getThingById(req, mockHttpResponse);

            expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_BAD_REQUEST);
            expect(mockDao.getThing).not.toHaveBeenCalled();
        });

        // it('fails due to an exception', async () => {
        //     mockDao.getThing.and.throwError('error');
        //     const req = { params: { id: 1 } };
        //
        //     await controller.getThingById(req, mockHttpResponse);
        //
        //     expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
        // });

    });

    describe('addThing', () => {
        it('succeeds', async () => {
            mockDao.addThing.and.resolveTo({rowCount: 1});
            const req = {
                params: { dataType: 'things'},
                body: { id: 99, name: 'Test Thing 4', t_size:22, weight: 33 }
            };

            await controller.addThing(req, mockHttpResponse);

            expect(mockDao.addThing).toHaveBeenCalled();
            expect(mockHttpResponse.json).toHaveBeenCalledOnceWith({rowCount: 1});
        });

        it('fails due to an empty request body', async () => {
            const req = { params: {dataType: 'things'}, body: { } };

            await controller.addThing(req, mockHttpResponse);

            expect(mockDao.addThing).not.toHaveBeenCalled();
        });

        // it('fails due to an exception', async () => {
        //     mockDao.addThing.and.throwError('error');
        //     const req = {
        //         body: { id: 99, name: 'Test Thing 4' }
        //     };
        //
        //     await controller.addThing(req, mockHttpResponse);
        //
        //     expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
        // });
    });

    describe('updateThing', () => {
        it('succeeds', async () => {
            mockDao.updateThing.and.resolveTo({rowCount: 1});
            const req = {
                params: { dataType: 'things'},
                body: { id: 99, name: 'Test Thing 4' , t_size: 22 ,weight: 34}
            };

            await controller.updateThing(req, mockHttpResponse);

            expect(mockDao.updateThing).toHaveBeenCalled();
            expect(mockHttpResponse.json).toHaveBeenCalledOnceWith({rowCount: 1});
        });

        it('fails due to an empty request body', async () => {
            const req = { params: {dataType: 'things'}, body: { } };

            await controller.updateThing(req, mockHttpResponse);

            expect(mockDao.updateThing).not.toHaveBeenCalled();
            expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_BAD_REQUEST);
        });

        // it('fails due to an exception', async () => {
        //     mockDao.updateThing.and.throwError('error');
        //     const req = {
        //         body: { id: 99, name: 'Test Thing 4' }
        //     };
        //
        //     await controller.updateThing(req, mockHttpResponse);
        //
        //     expect(mockHttpResponse.status).toHaveBeenCalledWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
        // });
    });

    describe('deleteThing', () => {
        it('succeeds', async () => {
            mockDao.deleteThing.and.resolveTo({rowCount: 1});
            const req = { params: { id: 1 } };

            await controller.deleteThing(req, mockHttpResponse);

            expect(mockDao.deleteThing).toHaveBeenCalled();
            expect(mockHttpResponse.json).toHaveBeenCalledOnceWith({ rowCount: 1 });
        });
        it('fails due to an invalid id', async () => {
            const req = { params: { id: -1 } };
            await controller.deleteThing(req, mockHttpResponse);

            expect(mockHttpResponse.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
            expect(mockDao.deleteThing).not.toHaveBeenCalled();
        });

//         it('fails due to a database exception', async () => {
// //            mockDao.deleteThing.and.throwError('fake database error');
//             const req = { params: { id: 1 } };
//
//             await controller.deleteThing(req, mockHttpResponse);
//
//             expect(mockHttpResponse.status).toHaveBeenCalledOnceWith(HTTP_STATUS_INTERNAL_SERVER_ERROR);
//         });
    });

});
