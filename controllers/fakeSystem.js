const PLANT_NAME = 'demo';
//const PLANT_NAME = 'demo'Projeto_super_2;
var runHandler;

const knex = require('../models/connSuper');
//knex.on('query', console.log)
var errorSim = false;

async function Sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

var isRunning = false, hasPlantStarted = false, stop = false;


var lastPath = 1;
function RandomPath() {
  
  if (lastPath === 1)
    lastPath = 0;
  else
    lastPath = 1;
  return lastPath;
  /*
  var y = Math.random();
  if (y < 0.5)
    y = 0;
  else
    y = 1;
  return y;
  */
}

//On-off
async function ToggleData(timeOn, address, log) {
  if(CheckStopSignal()) return;
  console.log(log);
  let addressOn = '{ "' + address + '": 1' + '}';
  let addressOff = '{ "' + address + '": 0' + '}';

  addressOn = JSON.parse(addressOn);
  addressOff = JSON.parse(addressOff);

  await knex('plants')
    .where('Nome_da_Planta', PLANT_NAME)
    .update(addressOn);

  if(CheckStopSignal()) return;

  await Sleep(timeOn);

  if(CheckStopSignal()) return;

  await knex('plants')
    .where('Nome_da_Planta', PLANT_NAME)
    .update(addressOff);

  if(CheckStopSignal()) return;
}

async function ResetDatabaseStatus(){
  await knex('plants')
    .where('Nome_da_Planta', PLANT_NAME)
    .update({
      Status_M100: 0,
      Status_M101: 0,
      Status_M102: 0,
      Status_M103: 0,
      Status_M104: 0,
      Status_M105: 0,
      Status_M106: 0,
      Status_M107: 0,
      Status_M108: 0,
      Status_M109: 0,
      Status_M110: 0,
      Status_M111: 0,
      Status_M112: 0,
      Status_M113: 0,
      Status_M114: 0,
      Status_M115: 0,
      Status_M116: 0,
      Status_M117: 0,
      Status_M118: 0,
      Status_M119: 0,
      Status_M120: 0,
      Status_M121: 0,
      Status_M122: 0,
      Status_M123: 0,
      Status_M124: 0,
      Status_M125: 0,
      Status_M126: 0,
      Status_M127: 0,
      Status_M128: 0,
      Status_M129: 0,
      Status_M130: 0,
      Status_M131: 0,
      Status_M132: 0,
      Status_M133: 0,
      Status_M134: 0,
      Status_M135: 0,
      Status_M136: 0,
      Status_M137: 0,
      Status_M138: 0,
      Status_M139: 0
    });
}

function CheckStopSignal(){
  if (stop === true){
    clearInterval(runHandler);
    hasPlantStarted = false;
    stop = false;
    isRunning = false;

    console.log("Plant simulation stopped.");

    return true;
  }
  return false;
}

async function Restart() {
  if (isRunning == false) {
    isRunning = true;
    await ResetDatabaseStatus();
    await Run();
  }
}

async function Run() {
  console.log("Starting a new run");
  if(CheckStopSignal()) return;
  await ToggleData(500, "Status_M120", "Emitter");
  //await Sleep(50);
  //Error simulation
  if (errorSim) {
    await Sleep(1500);
  }

  if(CheckStopSignal()) return;

  await ToggleData(500, "Status_M102", "Sensor Start");
  await Sleep(500);

  let path = RandomPath();
  if (path == 0) {
    if(CheckStopSignal()) return;
    console.log("Path 1");
    await Sleep(3600);
    await ToggleData(700, "Status_M103", "Sensor path 1");
    console.log("Exited plant in path 1");
    if(CheckStopSignal()) return;
  }
  else {
    if(CheckStopSignal()) return;
    //await ToggleData(250, "Status_M104", "Pivot Arm Sensor");
    //await Sleep(200);
    //Error simulation
    //if(errorSim) await Sleep(1500);
    if(CheckStopSignal()) return;
    await ToggleData(3300, "Status_M122", "Path 2");
    if(CheckStopSignal()) return;
    await Sleep(2200);
    if(CheckStopSignal()) return;
    await ToggleData(700, "Status_M104", "Sensor path 2");
    console.log("Exited plant in path 2");
    if(CheckStopSignal()) return;
  }
  isRunning = false;
}

module.exports = {
  async StartPlant(req, res) {
    if (hasPlantStarted === false) {
      runHandler = setInterval(Restart, 1000);
      hasPlantStarted = true;
    }
    return res.send("Initializing!");
  },

  async ReadStatus(req, res) {
    const allData = await knex('plants')
      .first('*')
      .where('Nome_da_Planta', PLANT_NAME);

    return res.json(allData);
  },

  async StartButton(req, res) {
    const btData = await knex('plants')
      .where('Nome_da_Planta', PLANT_NAME)
      .update({
        Status_M100: 1
      });

    await Sleep(1000);

    const data = await knex('plants')
      .where('Nome_da_Planta', PLANT_NAME)
      .update({
        Status_M100: 0
      });

    return res.json(btData);
  },

  async ToggleErrorSimulation(req, res) {
    errorSim = !errorSim;
    res.send("errorSim: " + errorSim);
  },

  async Stop(req, res) {
    stop = true;
    //await ResetDatabaseStatus();
    res.send("Plant simulation is stopping");
  }
}