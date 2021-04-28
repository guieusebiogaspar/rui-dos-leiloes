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

module.exports = router;