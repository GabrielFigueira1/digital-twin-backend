module.exports = {

    development: {
        client: 'mysql2',
        connection: {
          host: '127.0.0.1',
          database: 'super',
          user: 'root',
          password: 'root'
        },
        pool: {
        min: 2,
        max: 10
        },
        migrations: {
          directory: './models/migrations'
        },
        useNullAsDefault: true,
      },

      super: {
        client: 'mysql',
        connection: {
          host: 'virtualsetup.mysql.dbaas.com.br',
          database: 'virtualsetup',
          user: 'virtualsetup',
          password: 'projetosuper'
        },
        pool: {
        min: 2,
        max: 10
        },
        migrations: {
          directory: './models/migrations'
        },
        useNullAsDefault: true,
      },
  
    staging: {
      client: 'postgresql',
      connection: {
        database: 'my_db',
        user:     'username',
        password: 'password'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    },
  
    production: {
      client: 'postgresql',
      connection: {
        database: 'my_db',
        user:     'username',
        password: 'password'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    }
  
  };

/*
development: {
        client: 'mysql2',
        connection: {
          host: '127.0.0.1',
          database: 'teste',
          user: 'root',
          password: 'root'
        },
        pool: {
        min: 2,
        max: 10
        },
        migrations: {
          directory: './models/migrations'
        },
        useNullAsDefault: true,
      },
  super: {
        client: 'mysql2',
        connection: {
          host: '127.0.0.1',
          database: 'super',
          user: 'root',
          password: 'root'
        },
        pool: {
        min: 2,
        max: 10
        },
        migrations: {
          directory: './models/migrations'
        },
        useNullAsDefault: true,
      },
*/