const express = require("express");
const router = express.Router();
const verifyToken = require("../../verifyToken.js")

const LeiloesController = require("../controllers/leiloes");

// criar um novo leilão
router.post("/leilao", verifyToken, LeiloesController.cria_leilao)

// Listar todos os leilões
router.get("/", verifyToken, LeiloesController.get_leiloes);

// listar leilões existentes com o ean indicado
router.get("/:ean", verifyToken, LeiloesController.get_ean)

// listar leilao com o id indicado
router.get("/leilao/:leilaoid", verifyToken, LeiloesController.get_leilao);

// listar leilões em que user tenha atividade
router.get("/user/:userid", verifyToken, LeiloesController.get_leiloes_user)

// efetuar uma licitação num leilão
router.post("/leilao/:leilaoid", verifyToken, LeiloesController.post_licitacao)

// editar propriedades de um leilão
router.put("/leilao/:leilaoid", verifyToken, LeiloesController.put_editar_leilao)

// escrever mensagem no mural de um leilão
router.post("/leilao/mural/:leilaoid", verifyToken, LeiloesController.post_mural)

// Terminar leiloes
router.put("/terminar", verifyToken, LeiloesController.terminar_leiloes)

// admin cancela leilão
router.put("/cancelar/:leilaoid", verifyToken, LeiloesController.cancelar_leilao)


module.exports = router;