import { inject, injectable } from 'inversify';
import { Component } from '../shared/constants/index.js';
import { getMongoURI, getFullServerPath } from '../shared/helpers/index.js';
import express, { Express } from 'express';
import cors from 'cors';
import {
  ParseTokenMiddleware,
  type IController,
  type IExceptionFilter
} from '../shared/libs/rest/index.js';
import { STATIC_FILES_ROUTE, STATIC_UPLOAD_ROUTE } from './rest.constant.js';

import type { ILogger } from '../shared/libs/logger/index.js';
import type { IConfig, TRestSchema } from '../shared/libs/config/index.js';
import type { IDatabaseClient } from '../shared/libs/database-client/database-client.interface.js';

@injectable()
export class RestApplication {
  private readonly server: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: ILogger,
    @inject(Component.Config) private readonly config: IConfig<TRestSchema>,
    @inject(Component.DatabaseClient)
    private readonly databaseClient: IDatabaseClient,
    @inject(Component.ExceptionFilter)
    private readonly appExceptionFilter: IExceptionFilter,
    @inject(Component.UserController)
    private readonly userController: IController,
    @inject(Component.OfferController)
    private readonly offerController: IController,
    @inject(Component.AuthExceptionFilter)
    private readonly authExceptionFilter: IExceptionFilter,
    @inject(Component.HttpExceptionFilter)
    private readonly httpExceptionFilter: IExceptionFilter,
    @inject(Component.ValidationExceptionFilter)
    private readonly validationExceptionFilter: IExceptionFilter
  ) {
    this.server = express();
  }

  private async initDb() {
    const mongoUri = getMongoURI({
      username: this.config.get('DB_USER'),
      password: this.config.get('DB_PASSWORD'),
      host: this.config.get('DB_HOST'),
      port: this.config.get('DB_PORT'),
      databaseName: this.config.get('DB_NAME')
    });

    return this.databaseClient.connect(mongoUri);
  }

  private async initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port);
  }

  private async initControllers() {
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
  }

  private async initMiddlewares() {
    const authenticateMiddleware = new ParseTokenMiddleware(
      this.config.get('JWT_SECRET')
    );

    this.server.use(express.json());

    this.server.use(
      STATIC_UPLOAD_ROUTE,
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );

    this.server.use(
      STATIC_FILES_ROUTE,
      express.static(this.config.get('STATIC_DIRECTORY_PATH'))
    );

    this.server.use(
      authenticateMiddleware.execute.bind(authenticateMiddleware)
    );

    this.server.use(cors());
  }

  private async initExceptionFilters() {
    this.server.use(
      this.authExceptionFilter.catch.bind(this.authExceptionFilter)
    );
    this.server.use(
      this.validationExceptionFilter.catch.bind(this.validationExceptionFilter)
    );
    this.server.use(
      this.httpExceptionFilter.catch.bind(this.httpExceptionFilter)
    );
    this.server.use(
      this.appExceptionFilter.catch.bind(this.appExceptionFilter)
    );
  }

  async init() {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Init database…');
    await this.initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init app-level middleware');
    await this.initMiddlewares();
    this.logger.info('App-level middleware initialization completed');

    this.logger.info('Init controllers');
    await this.initControllers();
    this.logger.info('Controller initialization completed');

    this.logger.info('Init exception filters');
    await this.initExceptionFilters();
    this.logger.info('Exception filters initialization compleated');

    this.logger.info('Try to init server…');
    await this.initServer();
    this.logger.info(
      `🚀 Server started on ${getFullServerPath(
        this.config.get('HOST'),
        this.config.get('PORT')
      )}`
    );
  }
}
