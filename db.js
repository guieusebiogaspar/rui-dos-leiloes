const { Pool, Client } = require('pg')


const pool = new Pool({
    user: 'postgres',
    // password: *password pessoal*,
    password: '18012000',
    database: 'rui-dos-leiloes',
    host: 'localhost',
    port: 5432
})


module.exports = pool;