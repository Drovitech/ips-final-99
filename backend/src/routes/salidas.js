// backend/src/routes/salidas.js
const express = require("express");
const router = express.Router();

const salidaController = require("../controllers/salidaController");
const { protect, authorize, registrarLog } = require("../middleware/auth");

// GET /api/salidas
router.get("/", protect, salidaController.obtenerSalidas);

// POST /api/salidas
router.post(
  "/",
  protect,
  // ✅ AHORA SÍ: Enfermería puede crear salidas
  authorize("Administrador", "Almacén", "Enfermería"),
  registrarLog("Salidas", "Crear"),
  salidaController.crearSalida
);

module.exports = router;
