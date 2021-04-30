const express = require("express");
const router = express.Router();
const verifyToken = require("../../verifyToken.js")

const LeiloesController = require("../controllers/leiloes");

// criar um novo leilão
router.post("/leilao", verifyToken, LeiloesController.cria_leilao)

// Listar todos os leilões
router.get("/", verifyToken, LeiloesController.get_leiloes);

// listar leilões existentes com o ean indicado
router.get("/:ean", verifyToken, LeiloesController.get_ean);

// listar leilao com o id indicado
// AQUI FALTA METER AS MENSAGENS E HISTORICO DAS LICITAÇÕES
router.get("/leilao/:leilaoid", verifyToken, LeiloesController.get_leilao);

// listar leilões em que user tenha atividade

// efetuar uma licitação num leilão

// editar propriedades de um leilão
// AQUI FALTA METER AS VERSOES NO HISTORICO
router.put("/leilao/:leilaoid", verifyToken, LeiloesController.editar_leilao)



module.exports = router;