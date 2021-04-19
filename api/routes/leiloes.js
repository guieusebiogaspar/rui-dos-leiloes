const express = require("express");
const router = express.Router();

const LeiloesController = require("../controllers/leiloes");

// criar um novo leilão

// Listar todos os leilões
router.get("/", LeiloesController.get_leiloes);

// listar leilão escolhido

// listar leilões em que user tenha atividade

// editar propriedades de um leilão

// efetuar uma licitação num leilão


module.exports = router;