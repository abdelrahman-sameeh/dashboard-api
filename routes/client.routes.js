const express = require("express");
const router = express.Router();
const { allowTo, isAuth } = require("../controllers/auth.controllers");
const { getClients, deleteClient } = require("../controllers/client.controllers");

router.get("/clients", isAuth, allowTo("admin"), getClients);
router.delete("/clients/:id", isAuth, allowTo("admin"), deleteClient);

module.exports = router