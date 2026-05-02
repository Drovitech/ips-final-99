// backend/src/routes/infoIps.js
const express = require("express");
const router = express.Router();

// Si tienes protect, úsalo. Si no, déjalo público.
// const { protect } = require("../middleware/auth");

router.get("/", /* protect, */ (req, res) => {
  res.json({
    success: true,
    info: {
      nombre_ips: "IPS Salud+",
      sede_principal: "Sede Central – Bogotá",
      horario_operativo: "Lunes a Viernes 7:00 am – 6:00 pm",
      servicios_clinicos: ["Vacunación", "Consulta externa", "Urgencias"],
      correo_institucional: "farmacia@ipssalud.co",
      telefono_farmacia: "Ext. 1201",
    },
  });
});

module.exports = router;