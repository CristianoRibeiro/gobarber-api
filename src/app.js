import 'dotenv/config';

import express from 'express';

import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';

import path from 'path';
import routes from './routes';

import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    // The request handler must be the first middleware on the app
    this.server.use(Sentry.Handlers.requestHandler());

    this.middleare();
    this.routes();
    this.execeptionHandler();
  }

  middleare() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);

    this.server.use(Sentry.Handlers.errorHandler());
  }

  execeptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'developement') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
