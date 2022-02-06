const express = require('express');

const routes = express.Router();

const devicesController = require('./controllers/devices');

routes.get('/hello', devicesController.fetchAll);

module.exports = routes;