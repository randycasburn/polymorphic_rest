import express from 'express';
import dotenv from 'dotenv';
import restRequestLogger from 'morgan';
import logger from 'winston';
import thingsController from "./src/controllers/PolymorphicController.js";
import cors from 'cors';
class ThingRESTApplication {
  static main() {
    // Just like application.properties - found in .env file
    dotenv.config();
    // HTTP Server
    const app = express();
    app.use(cors({origin: "*"}));
    // Just like SLF4J
    logger.add(new logger.transports.Console({
      format: logger.format.simple()
    }));
    logger.info('Reading .env into process.env');
    logger.info('Setting up HTTP Request logger');
    // Automatically log all HTTP requests (to console for dev)
    app.use(restRequestLogger(`${process.env.loggerFormat}`));
    logger.info('Loading the Front Controller');
    // Entry point - would be "Front Controller" but only have one Thing here
    app.use(thingsController.setEndpoints());
    logger.info('Non-existent REST endpoints fallback to 404');
    // catch all other REST endpoint requests and throw NOT_FOUND
    app.use((req, res) => {
      res.status(404).end("no route defined");
    });
    // Start the service
    app.listen(process.env.port, () => {
      logger.info('Starting Express Server');
      logger.info(`Listening on port ${process.env.port}`);
    });
  }
}

ThingRESTApplication.main();
