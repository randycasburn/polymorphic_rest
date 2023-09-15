import express from 'express';
import bodyParser from 'body-parser';
import logger from 'winston';
import {constants} from 'http2';
import PoiymorphicOracleDBDao from "../dao/PoiymorphicOracleDBDao.js";
import DataTypes from "../models/DataTypesEnum.js";
const {
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND
} = constants;

class PolymorphicController {
  dao;

  constructor() {
    this.dao = new PoiymorphicOracleDBDao();
    this.router = express.Router();
    this.router.use(bodyParser.json());
    this.router.get('/:dataType', this.getAllThings.bind(this));
    this.router.get('/:dataType/:id', this.getThingById.bind(this));
    this.router.post('/:dataType', this.addThing.bind(this));
    this.router.put('/:dataType', this.updateThing.bind(this));
    this.router.delete('/:dataType/:id', this.deleteThing.bind(this));
  }

  setEndpoints() {
    return this.router;
  }

  getAllThings(req, res) {
    const thing = this.#validateInput(req.params.dataType, false, res);
    // Call Service and provide output
    let things = this.dao.getAllThings(req.params.dataType)
      .then(result => this.#sendResult(res, result))
      .catch(err => {
        logger.error(err.message);
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send();
      })
  }

  getThingById(req, res) {
    // validate input and short circuit if not valid
    // statuses are set in the method
    if (!this.#validateInput("number", req.params.id, res)) return;
    // Call Service and provide output
    let thing = this.dao.getThing(req.params.dataType, req.params.id)
      .then(result => this.#sendResult(res, result))
      .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR));
  }

  addThing(req, res) {
    // validate input and short circuit if not valid
    // statuses are set in the method
    if (!this.#validateInput(req.params.dataType, req.body, res)) return;
    logger.info("calling Service addThing with: " + JSON.stringify(req.body));
    // Call Service and provide output
    this.dao.addThing(req.params.dataType, req.body)
      .then(result => this.#sendResult(res, result))
      .catch(err => res.status(HTTP_STATUS_BAD_REQUEST).json({ error: `${err.message}` }))
  }

  updateThing(req, res) {
    // validate input and short circuit if not valid
    // statuses are set in the method
    if (!this.#validateInput(req.params.dataType, req.body, res)) return;
    logger.info("Calling Service updateThing with: " + JSON.stringify(req.body));
    // Call Service and provide output
    this.dao.updateThing(req.params.dataType, req.body)
      //.then(this.#processResponse)
      .then(result => this.#sendResult(res, result))
      .catch(err => res.status(HTTP_STATUS_BAD_REQUEST).json({ error: `${err.message}` }))
  }


  deleteThing(req, res) {
    // validate input and short circuit if not valid
    // statuses are set in the method
    if (!this.#validateInput("number", req.params.id, res)) return;
    logger.info(`Service deleteThing with id ${req.params.id}`);
    // Call Service and provide output
    this.dao.deleteThing(req.params.dataType, req.params.id)
      .then(result => this.#sendResult(res, result))
      .catch((err) => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send(err.message));
  }

  #sendResult(response, result) {
    !result
      ? response.status(HTTP_STATUS_NOT_FOUND).send()
      : response.json(result);
  }

  /**
   * If invalid, sets and sends status, returns boolean indicating success or failure
   * @param dataType
   * @param data
   * @param res
   * @returns {boolean}
   */
  #validateInput(dataType, data, res) {
    const shape = DataTypes.getClassFromDataType(dataType);
    let fields;
    let dataFields;
    switch (DataTypes[dataType]) {
      case DataTypes.number :
        let id = parseInt(data)
        if (isNaN(id) || id < 0) {
          res.status(HTTP_STATUS_BAD_REQUEST).send();
          // must return here to prevent additional headers
          return;
        }
        break;
      case DataTypes.things :
      case DataTypes.wings :
        if (!data) return; // get all things
        fields = [...Object.keys(new shape())];
        dataFields = [...Object.keys(data)];
        // check correct # of fields and that count matches
        if (fields.length !== dataFields.length ||
          new Set([fields, dataFields]).size === fields.length) {
          res.status(HTTP_STATUS_BAD_REQUEST).send();
          return false;
        }
        break;
      default :
        res.status(HTTP_STATUS_NOT_FOUND).send();
        return false;
    }
    return true;
  }
}

export default new PolymorphicController();
