const express = require("express");
const router = express.Router();

const LeiloesController = require("../controllers/leiloes");

router.get("/", LeiloesController.get_leiloes);

module.exports = router;