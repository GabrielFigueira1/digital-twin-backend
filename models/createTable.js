const knex = require('../models/connSuper');

module.exports = {
    async Create(req, res) {
        await knex('plants')
            .where('Nome_da_Planta', 'Teste')
            .update({
                Entrada_0: 'Start',
                Entrada_1: 'Sensor entrada',
                Entrada_2: 'Sensor Saida 1',
                Entrada_3: 'Sensor Saida 2',
                Entrada_4: 'Sensor desviador',
                Saida_0: 'Emitter Entrada',
                Saida_1: 'Esteira de Entrada',
                Saida_2: 'Pivot Arm Sorter Turn',
                Saida_3: 'Esteira 2',
            });

        return res.send("Table created.");
    }
}