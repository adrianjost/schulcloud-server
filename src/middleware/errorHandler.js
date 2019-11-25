const Sentry = require('@sentry/node');
const express = require('@feathersjs/express');
const decode = require('jwt-decode');

const { requestError } = require('../logger/systemLogger');
const logger = require('../logger');


const logRequestInfosInErrorCase = (error, req, res, next) => {
	if (error && !req.url.includes('/authentication')) {
		req.headers.authorization = undefined;
		let decodedJWT;
		try {
			decodedJWT = decode(req.headers.authorization);
		} catch (err) {
			decodedJWT = {};
		}

		requestError(req, (decodedJWT || {}).userId, error);
	}
	next(error);
};

const formatErrors = (error, req, res, next) => {
	if (error) {
		delete error.data; // error object
		if (error.stack) { // other errors
			logger.info(error.stack);
			delete error.stack;
		}
	}
	next(error);
};

const returnAsJson = express.errorHandler({
	html: (error, req, res) => {
		res.json(error);
	},
});

const errorHandler = (app) => {
	app.use(logRequestInfosInErrorCase);
	app.use(Sentry.Handlers.errorHandler());
	app.use(formatErrors);
	app.use(returnAsJson);
};

module.exports = errorHandler;
