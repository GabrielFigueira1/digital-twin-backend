const knex = require('../models/connSuper');
//knex.on('query', console.log)

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

async function Restart(){
  if (isRunning == false){
    isRunning = true;
    await Run();
  }
}

async function Run(){
    console.log("Starting a new run");

    await Sleep(1000);
    //sensor entrada
    const emmit = await knex('plants')
    .where('Nome_da_Planta', 'Demo')
    .update({
      Status_M101: 1
    });
    console.log("Emmited");
    await Sleep(250);

    const data = await knex('plants')
    .where('Nome_da_Planta', 'Demo')
    .update({
      Status_M101: 0
    });

    await Sleep(3000);
    //sensor desviador
    let path = RandomPath();
    const sensorTurn = await knex('plants')
    .where('Nome_da_Planta', 'Demo')
    .update({
      Status_M104: path
    });

    await Sleep(250);

    await knex('plants')
    .where('Nome_da_Planta', 'Demo')
    .update({
      Status_M104: 0
    });

    //path 1 -> exit 1
    if (path === 0){
        console.log("Path 1");
        await Sleep(5000);
        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M102: 1
        });
        console.log("Exited plant in path 1");
        
        await Sleep(250);
    
        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M102: 0
        });  
    }
    //path 2 -> turn arm -> exit 2
    else{
        console.log("Path 2");
        //turn arm
        await Sleep(500);
        console.log("Turning arm");

        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M122: 1
        });
    
        await Sleep(2000);
    
        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M122: 0
        });
        //Exit 2
        await Sleep(6000);
        console.log("Exited plant in path 2");

        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M103: 1
        });
    
        await Sleep(1000);
    
        await knex('plants')
        .where('Nome_da_Planta', 'Demo')
        .update({
          Status_M103: 0
        });
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
      .where('Nome_da_Planta', 'Demo');

    return res.json(allData);
  },

  async StartButton(req, res)
  {    
    const btData = await knex('plants')
      .where('Nome_da_Planta', 'Demo')
      .update({
        Status_M100: 1
      });

      await Sleep(1000);

      const data = await knex('plants')
      .where('Nome_da_Planta', 'Demo')
      .update({
        Status_M100: 0
      });

    return res.json(btData);
  }
}