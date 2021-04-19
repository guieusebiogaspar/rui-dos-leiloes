const express = require("express");
const bodyParser = require("body-parser");
const { Pool, Client } = require('pg')

const leiloesRoutes = require("./api/routes/leiloes");

const app = express();

app.use("/leiloes", leiloesRoutes);

// ERROS
//req = o que recebemos, res = resposta que damos
app.use((req, res, next) => {
    const err = new Error("Not found.");
    err.status = 404;
    next(err);
  });
  
  app.use((err, req, res, next) => {
    const status = err.status || 500; //se nao existir o status do erro, envia 500
  
    //se exitir erro (por exemplo 404 se nao exitir) envia isto:
    res.status(status).json({
      message: "Error not found! Status: " + status,
    });
  });

/*
const pool = new Pool({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 3211,
})


pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

const client = new Client({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 3211,
})

client.connect()


client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})
*/

module.exports = app;