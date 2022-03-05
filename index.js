const express = require('express');
const routes = require('./routes');
var cors = require('cors');
const app = express();

app.use(cors());

var corsOptions = {
    origin: 'http://localhost:8000',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json());
app.use(routes);

app.listen(3333);