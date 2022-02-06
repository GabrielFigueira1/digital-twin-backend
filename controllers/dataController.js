const knex = require('../models/connection');
knex.on('query', console.log)

module.exports = {
  async readAll(req, res){
        
    const allData = await knex('demo')
      .select('*');

    return res.json(allData);
    },

  async insertData(req, res){
    const { name, value } = req.body;
    const data = await knex('demo')
      .insert({
        name: name,
        value: value
      });

    return res.json(data);
  },

  async deleteLast(req, res){
    const lastRow = await knex('demo')
      .select('*')
      .orderBy('id', 'desc')
      .limit(1);

    var lastRowObj = JSON.stringify(lastRow[0]);
    lastRowObj = JSON.parse(lastRowObj);
    var lastId = lastRowObj.id;

    const delRow = await knex('demo')
      .where('id', lastId)
      .del();

    return res.send("Last element deleted. id: " + lastId);
  }
}