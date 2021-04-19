const express = require("express");
//const bodyParser = require("body-parser");
const morgan = require("morgan")
const cors = require("cors");

const leiloesRoutes = require("./api/routes/leiloes");
const usersRoutes = require("./api/routes/users");

const app = express();

/*
app.use(cors());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
})*/

// para receber no terminal os requests também
app.use(morgan("dev"));

// tornar o json mais readable e simples
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/users", usersRoutes);
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
