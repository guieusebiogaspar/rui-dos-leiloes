const { Pool } = require('pg')


const pool = new Pool({
    user: 'postgres',
    // password: *password pessoal*,
    password: '1801200',
    database: 'rui-dos-leiloes',
    host: 'localhost',
    port: 5432
})


pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
})


module.exports = pool;