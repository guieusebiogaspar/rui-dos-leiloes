const express = require("express");
const router = express.Router();

const UsersController = require("../controllers/users");

// listar todos os users (não é necessário, é so para testar)
router.get("/", UsersController.get_users);

// Registar um novo utilizador
router.post("/", UsersController.registar_user);

// login de um novo utilizador

module.exports = router;