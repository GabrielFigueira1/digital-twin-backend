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

async function UpdateDatabase(){
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

    for(let key in databaseObj){
        if(databaseObj[key] != null){
            let item = {};
            if(key.includes(INPUT_SUBSTRING) && !databaseObj[key].includes(BT_NAME_SUBSTRING)){
                item = {[key]: databaseObj[key]};
                inputs.push(item);
            }
            else if(key.includes(OUTPUT_SUBSTRING)){
                item = {[key]: databaseObj[key]};
                outputs.push(item);

                if(databaseObj[key].includes(EMITTER_NAME_SUBSTRING)){
                    isEmitterKey = true;
                }
            }
            else if(key.includes(S_INPUT_SUBSTRING[0]) || key.includes(S_INPUT_SUBSTRING[1])){
                item = {[key]: databaseObj[key]};
                //sInputs.push(item);
                sInputs.set(key, databaseObj[key]);
            }
            else if(key.includes(S_OUTPUT_SUBSTRING[0] || key.includes(S_OUTPUT_SUBSTRING[1]))){
                item = {[key]: databaseObj[key]};
                //sOutputs.push(item);
                sOutputs.set(key, databaseObj[key]);
                
                if (isEmitterKey){
                    emitterKeys.push(key);
                    isEmitterKey = false;
                }
            }
        }
    }
}

function DatabaseHasChanges(){
    let hasChanged = false;

    for (let [key, value] of sInputs){
        //console.log(value, previous_sInputs.get(key))
        if (value != previous_sInputs.get(key))
            hasChanged = true;
    }

    for (let [key, value] of sOutputs){
        if (value != previous_sOutputs.get(key))
            hasChanged = true;
    }

    previous_sInputs = new Map(sInputs);
    previous_sOutputs = new Map(sOutputs);

    //if(hasChanged === true)
        //console.log("Has database changed: " + hasChanged);
    return hasChanged;
}

//Returns the time since the last change. Result in miliseconds
function GetTimeSinceLastChange(){
    if (lastChangeTime === 0){
        lastChangeTime = Date.now();
        return 0;
    }

    let lastChange = Date.now() - lastChangeTime;
    lastChangeTime = Date.now();

    return lastChange;
}

function SaveBehaviour(){
    let mergedInOut = new Map([...sInputs, ...sOutputs]);
    mergedInOut.set("timestamp", GetTimeSinceLastChange());

    behaviour.push(mergedInOut);

   // console.log(behaviour);
}

//Check if a new product was emitted
var canEmitt = true;
function HasEmitted(){
    let onEmitterCount = 0;
    for (let i in emitterKeys){
        if (sOutputs.get(emitterKeys.at(i)) === 1){
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

//Saves the current behaviour in the data structure and reset behaviour array
//Checks if that behaviour is already in the memory
function PushBehaviour(){
    if (behaviour.length === 0) return;
    //for (it in behaviour) LogMap(behaviour[it]);

    
    

    /*for (let savedBehaviour of allBehaviours){
        for (let savedBehaviourItem of savedBehaviour){
            console.log(savedBehaviourItem.get('Status_M100'))
            
        }
    }*/
    //savedBehaviours -> array de mapas
    //allbehaviouars -> matriz de mapas
    //savedBehaviours -> 6 ou 10 passos
    //behaviour -> 6 ou 10 passos
    let isDifferent = false;
    for (let savedBehaviour of allBehaviours){
        if (behaviour.length !== savedBehaviour.length){
            console.log("Different length");
            isDifferent = true;
            //allBehaviours.push(behaviour);
            continue;
        }

        for (i = 0; i < savedBehaviour.length - 1; i++){
            for (let [key, value] of savedBehaviour[i]){
                if (key === "timestamp"){
                    break;
                }
                //console.log(savedBehaviour[i].get(key), behaviour[i].get(key));
                if (savedBehaviour[i].get(key) != behaviour[i].get(key))
                {
                    isDifferent = true;
                    console.log("Detected a new behaviour")
                }

            }
            //console.log(savedBehaviour[i].get("Status_M101")+ ", i = " + i)
        }
        

        //console.log(savedBehaviour[0]);
        //savedBehaviour === behaviour
        console.log(" ");

        //console.log(behaviour);
    }
    if (isDifferent){
        allBehaviours.push(behaviour);
        console.log(allBehaviours);
        isDifferent = false;
    }
    if (allBehaviours.length === 0){
        allBehaviours.push(behaviour);
        console.log(allBehaviours);
    }
    behaviour = [];
    lastChangeTime = 0;
    //console.log("All: ");
    //LogMap(allBehaviours);
    //console.log(allBehaviours);
}

async function StartLearning(){
    //Algorithm:
        //Define an entry point: emitter, btStart? -> emitter
        var isLearning = true;
        let canSave = false;
        
        //if (sOutputs[emitterKeys])
        while (isLearning)
        {
            //while (isLearning){
            //Listener to record database outputs changes events
            await UpdateDatabase();

            //Iteration ends when a new product is emitted
            if (HasEmitted()) {
                if (canSave)
                    PushBehaviour();
                else
                    canSave = true;
            }

            //If has changes, save the database context in a element of a data structure
            if (canSave) {
                if (DatabaseHasChanges()) {
                    if (lastChangeTime === -1) {
                        lastChangeTime = 0;
                    }
                    SaveBehaviour();
                    //Save every change with a timestamp
                }}

            //If a element within the data structure is exactly identical to another, discard that

            //However, if is different, add the element
            //Loop ends when an abirtrary defined value is reached. Can be time or num of iterations
            if (allBehaviours.length === expectedBehavioursAmount)
                isLearning = false;
        //}
        }
        
        console.log("Plant learned");
        console.log(allBehaviours.length + " differents behaviours mapped");
        //console.log(allBehaviours);

        //With the plant running
        //Should be another function? -> yes
        //Get the database state
        //Consider the database state as an index of the data structure
        //All database's states should match every element of the data structure array
            //Gives an error if a state not match
        //Every state should not take much longer than the time recorded in the data structure's timestamp 
            //Gives a warning if the state takes unexpected time - arbitrary threshold?
}

function LogMap(map){
    let cp = Object.fromEntries(map);
    console.log(cp);
}

function MapArrayToObject(map){
    let obj = [];
    for (it in behaviour){
        obj.push(Object.fromEntries(map[it]))
    }
    return obj;
}

function ResetComparation(){
    discarted = [];
    _lastChangeTime = 0;
    currentBehaviour = [];
    console.log("New cycle start");
}


function _GetTimeSinceLastChange(){
    if (_lastChangeTime === 0){
        _lastChangeTime = Date.now();
        return 0;
    }

    let lastChange = Date.now() - _lastChangeTime;
    _lastChangeTime = Date.now();

    return lastChange;
}

var currentBehaviour = [];
var aux =  0;
var discarted = [];
//Fatal divergence -> different database
//Warnig divergence -> timestamp above threshold
function CheckForAnomalies(){
    let temp = new Map([...sInputs, ...sOutputs]);
    temp.set("timestamp", _GetTimeSinceLastChange());
    currentBehaviour.push(temp);
    let j = currentBehaviour.length - 1;

    let hasAnomalies = false;
    loop1: for (i = 0; i < allBehaviours.length; i++){
        if (discarted.includes(i)){
            break;
        }
        //for (j = 0; j < currentBehaviour[i].length; j++){
            for (let [key, value] of allBehaviours[i][j]){
                //Esta testando todos os "j"
                //So tem que testar 1
                if (allBehaviours[i][j].get(key) != temp.get(key) && key != "timestamp")
                {
                    //console.log("discarted temp " + discarted);
                    //console.log("current status ")
                    //console.log(temp)
                    //console.log("expected status ")
                   // console.log(allBehaviours[i][j])

                    discarted.push(i);
                    if (discarted.length >= allBehaviours.length){
                        console.log("Detected a fatal divergence");
                        console.log("Expected: " + key + ": " + allBehaviours[i][j].get(key));
                        console.log("Actual: " + key + ": " + temp.get(key));
                        console.log("discarted behaviours: " + discarted);
                        break loop1;
                    }
                    continue loop1;
                }
                else if (key === "timestamp"){
                    //||  temp.get(key) < (allBehaviours[i][j].get(key) - ANOMALIE_THESHOLD)
                    if (temp.get(key) > (allBehaviours[i][j].get(key) + ANOMALIE_THESHOLD)
                    ){
                        console.log("Detected a timestamp anomalie");
                        console.log("Timestamp: " + temp.get(key) + " Expected: " + allBehaviours[i][j].get(key));
                    }
                }
            }
        //}
    }
    /*
    for (let savedBehaviour of allBehaviours){
        for (i = 0; i < currentBehaviour.length - 1; i++){
            for (let [key, value] of savedBehaviour[i]){
                if (key === "timestamp"){
                    break;
                }
                //console.log(savedBehaviour[i].get(key), behaviour[i].get(key));
                if (savedBehaviour[i].get(key) != temp.get(key))
                {
                    hasAnomalies = true;
                    console.log("Detected an anomalie");
                    console.log(temp.get(key), savedBehaviour[i].get(key));
                }
            }
        }
        
    }*/

    //currentBehaviour.push(mergedInOut);
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
        /*
            atualizar database --
            esperar estado de inicio com emitter
            esperar atualizacao do database
                Salvar estado
                comparar com estados aprendidos
        */
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
    }
}