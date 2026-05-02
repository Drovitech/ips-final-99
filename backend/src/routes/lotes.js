// backend/src/routes/lotes.js
const express = require("express");
const router = express.Router();

const loteController = require("../controllers/loteController");
const { protect, authorize, registrarLog } = require("../middleware/auth");

// listar
router.get("/", protect, loteController.obtenerLotes);

// crear
router.post(
  "/",
  protect,
  authorize("Administrador", "Almacén"),
  registrarLog("Lotes", "Crear"),
  loteController.crearLote
);

module.exports = router;
