const { Pool, Client } = require('pg')
require('dotenv').config(); // para ir buscar o env file

const pool = new Pool({
    user: 'postgres',
    password: process.env.DB_PASSWORD, // para usar a password criar um ficheio .env com uma variavel DB_PASSWORD = *password*
    database: 'rui-dos-leiloes',
    host: 'localhost',
    port: 5432
})



module.exports = pool;