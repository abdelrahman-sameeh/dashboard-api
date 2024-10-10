const express = require("express");
const router = express.Router();
const { allowTo, isAuth } = require("../controllers/auth.controllers");
const { getClients } = require("../controllers/client.controllers");

router.get("/clients", isAuth, allowTo("admin"), getClients);

module.exports = router