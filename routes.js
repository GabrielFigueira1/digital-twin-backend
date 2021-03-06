const express = require('express');
const res = require('express/lib/response');

const routes = express.Router();

const dataController = require('./controllers/dataController');
const fakeSystem = require('./controllers/fakeSystem');
const learn = require('./controllers/plantLearner');
const createTable = require('./models/createTable');

routes.get('/', (req, res) => {
    res.send("Server is running.");
});

routes.get('/readAll', dataController.readAll);

routes.get('/readLast', dataController.readLast);

routes.get('/deleteLast', dataController.deleteLast);

routes.post('/insertData', dataController.insertData);

routes.get('/ReadStatus', fakeSystem.ReadStatus);

routes.get('/StartButton', fakeSystem.StartButton);

routes.get('/Run', fakeSystem.StartPlant);

routes.get('/Stop', fakeSystem.Stop);

routes.get('/Learn', learn.Learn);

routes.get('/CheckAnomalies', learn.Anomalies);

routes.get('/ReadAnomalies', learn.ReadAnomalies);

routes.get('/ToggleError', fakeSystem.ToggleErrorSimulation);

//Only for tests
routes.get('/writeDatabase', createTable.Create);

module.exports = routes;