const knex = require('../models/connSuper');
//knex.on('query', console.log)
var errorSim = false;

async function Sleep(timeout){
  return new Promise(resolve => setTimeout(resolve, timeout));
}

var isRunning = false, isPlantStarted = false;

function RandomPath(){
  var y = Math.random();
  if (y < 0.5)
    y = 0;
  else
    y = 1;
  return y;
}

//On-off
async function ToggleData(timeOn, address, log){
  console.log(log);
  let addressOn = '{ "' + address + '": 1' + '}';
  let addressOff = '{ "' + address + '": 0' + '}';

  addressOn = JSON.parse(addressOn);
  addressOff = JSON.parse(addressOff);

  await knex('plants')
    .where('Nome_da_Planta', 'demo')
    .update(addressOn);
  
  await Sleep(timeOn);

  await knex('plants')
    .where('Nome_da_Planta', 'demo')
    .update(addressOff);    
}
async function SetData(){}

async function Restart(){
  if (isRunning == false){
    isRunning = true;
    await Run();
  }
}

async function Run(){
    console.log("Starting a new run");

    await ToggleData(250, "Status_M120", "Emitter");
    await Sleep(250);
    //Error simulation
    if(errorSim) await Sleep(1500);
    await ToggleData(500, "Status_M101", "Sensor Start");
    await Sleep(3000);

    let path = RandomPath();
    if (path === 0){
      console.log("Path 1");
      await Sleep(5000);
      await ToggleData(250, "Status_M102", "Sensor path 1");
      console.log("Exited plant in path 1");
    }
    else{
      await ToggleData(250, "Status_M104", "Pivot Arm Sensor");
      await Sleep(500);
      //Error simulation
      //if(errorSim) await Sleep(1500);
      await ToggleData(2000, "Status_M122", "Path 2");
      await Sleep(6000);
      await ToggleData(300, "Status_M103", "Sensor path 2");
      console.log("Exited plant in path 2");
    }
    isRunning = false;
}

module.exports = {
  async StartPlant(req, res)
  { 
    if (isPlantStarted === false){
      setInterval(Restart, 1000);
      isPlantStarted = true;
    }   
    return res.send("Initialized!");
  },

  async ReadStatus(req, res)
  {    
    const allData = await knex('plants')
      .first('*')
      .where('Nome_da_Planta', 'demo');

    return res.json(allData);
  },

  async StartButton(req, res)
  {    
    const btData = await knex('plants')
      .where('Nome_da_Planta', 'demo')
      .update({
        Status_M100: 1
      });

      await Sleep(1000);

      const data = await knex('plants')
      .where('Nome_da_Planta', 'demo')
      .update({
        Status_M100: 0
      });

    return res.json(btData);
  },
  async ToggleErrorSimulation(req, res){
    errorSim = !errorSim;
    res.send("errorSim: " + errorSim);
  }
}