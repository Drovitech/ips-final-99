// backend/src/routes/entradas.js
const express = require("express");
const router = express.Router();

const entradaController = require("../controllers/entradaController");
const { protect, authorize, registrarLog } = require("../middleware/auth");

// GET /api/entradas
router.get("/", protect, entradaController.obtenerEntradas);

// POST /api/entradas
router.post(
  "/",
  protect,
  authorize("Administrador", "Administrador Sistema", "Almacén"),
  registrarLog("Entradas", "Crear"),
  entradaController.registrarEntrada
);

module.exports = router;


