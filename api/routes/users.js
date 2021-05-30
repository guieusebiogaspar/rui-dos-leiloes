const express = require("express");
const router = express.Router();
const verifyToken = require("../../verifyToken.js")

const UsersController = require("../controllers/users");

// listar todos os users (não é necessário, é so para testar)
router.get("/", verifyToken, UsersController.get_users);

// Registar um novo utilizador
router.post("/signup", UsersController.registar_user);

// login de um novo utilizador
router.put("/login", UsersController.login_user);

// Tal como nos abrirmos a nossa caixa de mail e nao abrims alguns mails
// aqui a situação é um bocado semelhante. As mensagesns só passam a lidas
// caso sejam vistas no endpoint /notificacoes

// caixa de entrada de um user
router.get("/mail", verifyToken, UsersController.get_mensagens);

// notificações de um user
router.get("/notificacoes", verifyToken, UsersController.get_notificacoes);

// admin bane user

module.exports = router;