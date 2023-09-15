import dotenv from "dotenv";
import logger from "winston";
import oracledb from 'oracledb';

dotenv.config();
oracledb.autoCommit = false;


class OracleSQLUtility {

  #connectionProperties = {
    user: `${process.env.odbUser}`,
    password: `${process.env.odbPassword}`,
    port: `${process.env.odbPort}`,
    connectionString: `${process.env.odbHost}/${process.env.odbServerName}`
  };

  /**
   * Simple queries that do not require transactions
   *
   * @param text
   * @param params
   * @returns {Promise<*>}
   */
  async query(text, params = []) {
    try {
      let connection = await oracledb.getConnection(this.#connectionProperties)
      let res =  await connection.execute(text, params, {autoCommit: true});
      logger.info(`executed query | ${text} | affected ${res.rows.length} rows`)
      return res;
    } catch (e) {
      logger.error(`query failed | ${text} | ${e.message}`);
      return Promise.reject(`query failed | ${text} | ${e.message}`);
    }
  }

  /**
   * Transaction based queries - INSERT, UPDATE, DELETE, ALTER, etc.
   *
   * Accepts multiple queries that make up all the calls in the transaction.
   *
   * Accepts an array of objects in the form:
   * {sql: String, params: [query substitution parameters]}
   *
   * @param statementsWithParams
   * @returns {Promise<{rowCount: Awaited<unknown>}>}
   */
  async transaction(statementsWithParams) {
    let results = [];
    let transactional;
    try {
      transactional = await oracledb.getConnection(this.#connectionProperties);
      // The map() method creates an array of promises
      results = await statementsWithParams.map(async ({sql, params}) => {
          const res = await transactional.execute(sql, params);
          logger.info(`executed query | ${sql} | with params ${params} | affected ${res.rowsAffected} rows`);
        return res;
      });
      transactional.commit();
    } catch (e) {
      transactional.rollback();
      logger.error(`query failed | ${sql} | ${e.message}`);
      // Notify of the failure by forcing a promise rejection
      return Promise.reject(`query failed | ${sql} | ${e.message}`);
    } finally {
      transactional.release();
    }
    // The .map() call produces an array of promises - this returns a single promise of array of Results
    return Promise.all(results);
  }
}

export default new OracleSQLUtility();
