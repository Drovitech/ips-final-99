const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, authorize } = require("../middleware/auth");

router.get(
  "/status",
  protect,
  authorize("Administrador", "Auditor"),
  async (_req, res) => {
    const dbState = mongoose.connection.readyState; // 1 conectado
    const dbConnected = dbState === 1;

    res.json({
      success: true,
      status: {
        database: dbConnected ? "Conectada" : "No conectada",
        dbState,
        serverTime: new Date().toISOString(),
        version: process.env.APP_VERSION || "4.0.0",
        environment: process.env.NODE_ENV || "development",
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  }
);

module.exports = router;