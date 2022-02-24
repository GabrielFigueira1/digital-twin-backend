const INPUT_SUBSTRING = "Entrada";
const OUTPUT_SUBSTRING = "Sa";
const S_INPUT_SUBSTRING = ["Status_M10", "Status_M11"];
const S_OUTPUT_SUBSTRING = ["Status_M12", "Status_M13"];
const BT_NAME_SUBSTRING = "Start";
const EMITTER_NAME_SUBSTRING = "Emitt";

var databaseObj;

var lastChangeTime = -1;
var learnStartTime;

const expectedBehavioursAmount = 2; //TODO: Change it to URL parameter

var databaseBehaviour = []; //The data structure that holds all expected behaviours of the plant\

//Parsed data lists
var inputs = [], outputs = [], sInputs = [], sOutputs = [];
var emitterIndex;

//List to test if database has changed
var previous_sInputs = [], previous_sOutputs = [];

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
    sInputs = [];
    sOutputs = [];

    for(key in databaseObj){
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
                    emitterIndex = outputs.indexOf(item);
                }
            }
            else if(key.includes(S_INPUT_SUBSTRING[0]) || key.includes(S_INPUT_SUBSTRING[1])){
                item = {[key]: databaseObj[key]};
                sInputs.push(item);
            }
            else if(key.includes(S_OUTPUT_SUBSTRING[0] || key.includes(S_OUTPUT_SUBSTRING[1]))){
                item = {[key]: databaseObj[key]};
                sOutputs.push(item);
            }
        }
    }
}

function DatabaseHasChanges(){
    let hasChanged = false;

    for (i = 0; i < sInputs.length; i++){
        if (sInputs[i] != previous_sInputs[i]){
            hasChanged = true;
        }
    }
    for (i = 0; i < sOutputs.length; i++){
        if (sOutputs[i] != previous_sOutputs[i]){
            hasChanged = true;
        }
    }
    Object.assign(previous_sInputs, sInputs);
    Object.assign(previous_sOutputs, sOutputs);

    console.log("Has database changed: " + hasChanged);
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
    let timestamp = { timestamp: GetTimeSinceLastChange()}
    let mergedInOut = sInputs.concat(sOutputs);
    let mergedArr = [];
    mergedInOut = mergedInOut.map((item) => {
        mergedArr = {...mergedArr, ...item}
    });

    let mergedObject = {...mergedArr, ...timestamp};
    databaseBehaviour.push(mergedObject);

    console.log(databaseBehaviour.length);
    console.log(databaseBehaviour);
}

module.exports = {

async Learn(req, res){
    //Algorithm v0.1:
        //Define an entry point: emitter, btStart? -> emitter
        var isLearning = true;
        
        //if (sOutputs[emitterIndex])
        if (isLearning)
        {
            isLearning = true;

            //while (isLearning){
                //Listener to record database outputs changes events
                await UpdateDatabase();
                //If has changes, save the database context in a element of a data structure

                if (DatabaseHasChanges()){
                    if (lastChangeTime === -1) 
                    {
                        lastChangeTime = 0;
                    }
                    //Save every change with a timestamp
                    SaveBehaviour();
                }
                //Iteration ends when a new product is emitted
                if (sOutputs[emitterIndex] === 1){
                    //recursive
                    //Do all again
                }
                //If a element within the data structure is exactly identical to another, discard that

                //However, if is different, add the element
                //Loop ends when an abirtrary defined value is reached. Can be time or num of iterations
            if (databaseBehaviour.length == expectedBehavioursAmount)
                isLearning = false;
        //}
        }
    res.json(databaseObj);
        
        
        //With the plant running
        //Should be another function?
        //Get the database state
        //Consider the database state as an index of the data structure
        //All database's states should match every element of the data structure array
            //Gives an error if a state not match
        //Every state should not take much longer than the time recorded in the data structure's timestamp 
            //Gives a warning if the state takes unexpected time - arbitrary threshold?
}
}