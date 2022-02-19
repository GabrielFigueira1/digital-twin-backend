const knex = require('../models/connection');
knex.on('query', console.log)

module.exports = {
  async readAll(req, res){
        
    const allData = await knex('demo')
      .select('*');

    return res.json(allData);
    },

  async insertData(req, res) {
    try {
      const { name, value } = req.body;
      const data = await knex('demo')
        .insert({
          name: name,
          value: parseInt(value)
        });

      return res.json(data);
    } catch (error) {
      console.log(error);
    }
  },

  async deleteLast(req, res){
    const lastRow = await knex('demo')
      .first('*')
      .orderBy('id', 'desc')

    var lastRowObj = JSON.stringify(lastRow);
    lastRowObj = JSON.parse(lastRowObj);
    var lastId = lastRowObj.id;

    const delRow = await knex('demo')
      .where('id', lastId)
      .del();

    return res.send("Last element deleted. id: " + lastId + " Name: " + lastRowObj.name + " Value: lastRowObj.value" );
  },

  async readLast(req, res){
    const row = await knex('demo')
      .first('*')
      .orderBy('id', 'desc')

    return res.json(row);
  }
}