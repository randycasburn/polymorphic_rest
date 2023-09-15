import db from '../utils/OracleSQLUtility.js';
import Thing from "../models/Thing.js";
import logger from "winston";
import Wings from "../models/Wings.js";
import DataTypes from "../models/DataTypesEnum.js";
class PoiymorphicOracleDBDao {

  /**
   * Get Collection
   * @returns {Promise<Thing[]>}
   */
  getAllThings(dataType) {
    const shape = DataTypes.getClassFromDataType(dataType);
    return db.query(`SELECT *
                     FROM ${dataType}`)
      .then(res => res.rows.map(record => new shape(...record)))
      .catch(err => {
        logger.error(err);
        return false;
      });
  }

  /**
   * Get one by id
   * @param id
   * @returns {Promise<Thing>}
   */
  getThing(dataType, id) {
    const shape = DataTypes.getClassFromDataType(dataType);
    return db.query(`SELECT *
                     FROM ${dataType}
                     WHERE id = :1`, [id])
      .then(res => {
        return res.rows.length > 0
          ? new shape(...res.rows[0])
          : false;
      })
      .catch(err => {
        logger.error(err);
        return false;
      });
  }

  /**
   * Add one
   * @param thing
   * @returns {Promise<{rowCount: *}>}
   */
  addThing(dataType, thing) {
    const fields  = [...Object.keys(thing)];
    const params  = [...Object.values(thing)];
    const valueString  = params.map((v,i)=>`:${i+1}`);

    const sql = `INSERT INTO ${dataType} VALUES(${valueString})`;
    return db.transaction([{ sql, params }])
      .then(resultSet => this.#countRows(resultSet))
      .catch(err =>{throw new Error(err.message)});
  }

  /**
   * Update one
   * @param thing
   * @returns {Promise<{rowCount: *}>}
   */
  updateThing(dataType, thing) {
    const fields  = [...Object.keys(thing)];
    const values  = [...Object.values(thing)];
    const valueString  = [...Object.values(thing)].map((v,i)=>`${fields[i]}=:${fields[i]}`);
    const sql = `UPDATE ${dataType} SET ${valueString} WHERE id = :id`;
//    const params = [values];
    const params = thing;
    return db.transaction([ {sql, params} ])
      .then(resultSet => this.#countRows(resultSet))
      .catch(err =>{throw new Error(err.message)});
  }

  /**
   * Remove one by id
   * @param id
   * @returns {Promise<{rowCount: *}>}
   */
  deleteThing(dataType, id) {
    const sql = `DELETE FROM ${dataType} WHERE id = :1`;
    const params = [id]
    return db.transaction([{ sql, params }])
      .then(resultSet => this.#countRows(resultSet))
      .catch(err => {
        throw new Error(err.message);
      })
  }

  /**
   * Parse the returned set of rows to count how many were effected
   * @param resultSet
   * @returns {{rowCount: *}}
   */
  #countRows(resultSet) {
    const totalRowCount = resultSet.reduce((curr, next) => {
      return curr + next.rowsAffected
    }, 0); // {total rowCount from all transactions: #}

    return totalRowCount > 0
      ? { rowCount: totalRowCount }
      : false;
  }

}

export default PoiymorphicOracleDBDao;
