const express = require('express');
const res = require('express/lib/response');

const routes = express.Router();

const dataController = require('./controllers/dataController');

routes.get('/', (req, res) => {
    res.send("<p>Server is running.</p>");
});

routes.get('/readAll', dataController.readAll);

routes.post('/insertData', dataController.insertData);

routes.get('/deleteLast', dataController.deleteLast);

module.exports = routes;