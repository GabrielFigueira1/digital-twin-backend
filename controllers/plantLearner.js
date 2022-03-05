const INPUT_SUBSTRING = "Entrada";
const OUTPUT_SUBSTRING = "Sa";
const S_INPUT_SUBSTRING = ["Status_M10", "Status_M11"];
const S_OUTPUT_SUBSTRING = ["Status_M12", "Status_M13"];
const BT_NAME_SUBSTRING = "Start";
const EMITTER_NAME_SUBSTRING = "Emitt";
const ANOMALIE_THESHOLD = 150;

var databaseObj;

var lastChangeTime = -1;
var _lastChangeTime = -1;

var anomalies = []; //Stack with all anomalies detected
var anomaliesCount = 0;

const expectedBehavioursAmount = 2; //TODO: Change it to URL parameter

var allBehaviours = []; //The data structure that holds all expected behaviours of the plant\
var behaviour = []; //One single behaviour
//Parsed data lists
var inputs = [], outputs = [], sInputs = new Map(), sOutputs = new Map();
var emitterKeys = [];

//List to test if database has changed
var previous_sInputs = new Map, previous_sOutputs = new Map;

//Data structure that holds every behaviour of the database with a corresponding timestamp
var expectedBehaviours = [];

const res = require('express/lib/response');
const knex = require('../models/connSuper');

async function UpdateDatabase() {
    const database = await knex('plants')
        .first('*')
        .where('Nome_da_Planta', 'demo');

    databaseObj = JSON.stringify(database);
    databaseObj = JSON.parse(databaseObj);

    //JSON parse -> separate in "entradas", "saidas", "statusEntrada", "statusSaida"
    inputs = [];
    outputs = [];
    sInputs.clear();
    sOutputs.clear();
    emitterKeys = [];
    let isEmitterKey = false;

    for (let key in databaseObj) {
        if (databaseObj[key] != null) {
            let item = {};
            if (key.includes(INPUT_SUBSTRING) && !databaseObj[key].includes(BT_NAME_SUBSTRING)) {
                item = { [key]: databaseObj[key] };
                inputs.push(item);
            }
            else if (key.includes(OUTPUT_SUBSTRING)) {
                item = { [key]: databaseObj[key] };
                outputs.push(item);

                if (databaseObj[key].includes(EMITTER_NAME_SUBSTRING)) {
                    isEmitterKey = true;
                }
            }
            else if (key.includes(S_INPUT_SUBSTRING[0]) || key.includes(S_INPUT_SUBSTRING[1])) {
                item = { [key]: databaseObj[key] };
                sInputs.set(key, databaseObj[key]);
            }
            else if (key.includes(S_OUTPUT_SUBSTRING[0] || key.includes(S_OUTPUT_SUBSTRING[1]))) {
                item = { [key]: databaseObj[key] };
                sOutputs.set(key, databaseObj[key]);

                if (isEmitterKey) {
                    emitterKeys.push(key);
                    isEmitterKey = false;
                }
            }
        }
    }
}

function DatabaseHasChanges() {
    let hasChanged = false;

    for (let [key, value] of sInputs) {
        if (value != previous_sInputs.get(key))
            hasChanged = true;
    }

    for (let [key, value] of sOutputs) {
        if (value != previous_sOutputs.get(key))
            hasChanged = true;
    }

    previous_sInputs = new Map(sInputs);
    previous_sOutputs = new Map(sOutputs);

    return hasChanged;
}

//Returns the time since the last change. Result in miliseconds
function GetTimeSinceLastChange() {
    if (lastChangeTime === 0) {
        lastChangeTime = Date.now();
        return 0;
    }

    let lastChange = Date.now() - lastChangeTime;
    lastChangeTime = Date.now();

    return lastChange;
}

function SaveBehaviour() {
    let mergedInOut = new Map([...sInputs, ...sOutputs]);
    mergedInOut.set("timestamp", GetTimeSinceLastChange());

    behaviour.push(mergedInOut);
}

//Check if a new product was emitted
var canEmitt = true;
function HasEmitted() {
    let onEmitterCount = 0;
    for (let i in emitterKeys) {
        if (sOutputs.get(emitterKeys.at(i)) === 1) {
            onEmitterCount++;
            if (canEmitt === true) {
                canEmitt = false;
                console.log("New product emitteddddddd");
                return true;
            }
        }
    }
    if (onEmitterCount === 0)
        canEmitt = true;

    return false;
}


function PushBehaviour() {
    if (behaviour.length === 0) return;
    let isDifferent = false;
    for (let savedBehaviour of allBehaviours) {
        if (behaviour.length !== savedBehaviour.length) {
            console.log("Different length");
            isDifferent = true;
            continue;
        }
        for (i = 0; i < savedBehaviour.length - 1; i++) {
            for (let [key, value] of savedBehaviour[i]) {
                if (key === "timestamp") {
                    break;
                }
                if (savedBehaviour[i].get(key) != behaviour[i].get(key)) {
                    isDifferent = true;
                    console.log("Detected a new behaviour")
                }
            }
        }
        console.log(" ");
    }
    if (isDifferent) {
        allBehaviours.push(behaviour);
        console.log(allBehaviours);
        isDifferent = false;
    }
    if (allBehaviours.length === 0) {
        allBehaviours.push(behaviour);
        console.log(allBehaviours);
    }
    behaviour = [];
    lastChangeTime = 0;
}

async function StartLearning() {
    var isLearning = true;
    let canSave = false;

    while (isLearning) {
        await UpdateDatabase();

        //Iteration ends when a new product is emitted
        if (HasEmitted()) {
            if (canSave){
                SaveBehaviour();
                PushBehaviour();
            }
            else
                canSave = true;
        }

        if (canSave) {
            if (DatabaseHasChanges()) {
                if (lastChangeTime === -1) {
                    lastChangeTime = 0;
                }
                SaveBehaviour();
            }
        }
        if (allBehaviours.length === expectedBehavioursAmount)
            isLearning = false;

    }

    console.log("Plant learned");
    console.log(allBehaviours.length + " differents behaviours mapped");
}

function ResetComparation() {
    discarted = [];
    _lastChangeTime = 0;
    currentBehaviour = [];
    console.log("New cycle start");
}


function _GetTimeSinceLastChange() {
    if (_lastChangeTime === 0) {
        _lastChangeTime = Date.now();
        return 0;
    }

    let lastChange = Date.now() - _lastChangeTime;
    _lastChangeTime = Date.now();

    return lastChange;
}

var currentBehaviour = [];
var discarted = [];
//Fatal divergence -> different database
//Warning divergence -> timestamp above threshold
function CheckForAnomalies() {
    let temp = new Map([...sInputs, ...sOutputs]);
    temp.set("timestamp", _GetTimeSinceLastChange());
    currentBehaviour.push(temp);
    let j = currentBehaviour.length - 1;

    loop1: for (i = 0; i < allBehaviours.length; i++) {
        if (discarted.includes(i)) {
            break;
        }
        let hasPostedAnomalie = false;
        for (let [key, value] of allBehaviours[i][j]) {
            if (allBehaviours[i][j].get(key) != temp.get(key) && key != "timestamp") {
                discarted.push(i);
                if (discarted.length >= allBehaviours.length) {
                    console.log("Detected a fatal divergence");
                    console.log("Expected: " + key + ": " + allBehaviours[i][j].get(key));
                    console.log("Actual: " + key + ": " + temp.get(key));
                    console.log("discarted behaviours: " + discarted);
                    sendAnomalie("O valor de " + key + " é " + temp.get(key) + ". Esperado: " + allBehaviours[i][j].get(key));
                    break loop1;
                }
                continue loop1;
            }
            else if (key === "timestamp") {
                if ((temp.get(key) > (allBehaviours[i][j].get(key) + ANOMALIE_THESHOLD)
                    || temp.get(key) < (allBehaviours[i][j].get(key) - ANOMALIE_THESHOLD)
                ) && !hasPostedAnomalie) {
                    console.log("Detected a timestamp anomalie");
                    console.log("Timestamp: " + temp.get(key) + " Esperado: " + allBehaviours[i][j].get(key));
                    sendAnomalie("Há um atraso em uma etapa da planta. " + key + " é " + temp.get(key) + ". Esperado: " + allBehaviours[i][j].get(key));
                    hasPostedAnomalie = true;
                }
            }
        }
    }
}

function sendAnomalie(message) {
    anomaliesCount++;
    let time = new Date();
    message = "[" + time + "] " + message;
    let anomalieExtra = { anomalieId: anomaliesCount }
    message = Object.assign(anomalieExtra, { message });
    anomalies.push(message);
    console.log(anomalies);

    console.log(anomaliesCount);
}

async function StartMonitoring() {
    previous_sInputs = new Map, previous_sOutputs = new Map;
    let canCheck = false;

    while (true) {
        await UpdateDatabase();

        if (HasEmitted()) {
            if (canCheck)
                ResetComparation();
            else
                canCheck = true;
        }

        if (canCheck) {
            if (DatabaseHasChanges() && canCheck) {
                if (_lastChangeTime === -1) {
                    _lastChangeTime = 0;
                }
                CheckForAnomalies();
            }
        }
    }
}

module.exports = {
    async Learn(req, res) {
        StartLearning();
        res.send("Plant behaviour is beeing learned");
    },
    async Anomalies(req, res) {
        StartMonitoring();
        res.send("Database is beeing monitored");
    },
    async ReadAnomalies(req, res) {
        //Should write in the database?
        return res.json(anomalies.shift());
    }
}