// backend/src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Producto = require('../models/Producto');
const Entrada = require('../models/Entrada.js');
const Salida = require('../models/Salida');
const Lote = require('../models/Lote');

router.get('/estadisticas', protect, async (req, res, next) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Productos con stock bajo
    const stockCritico = await Producto.countDocuments({
      activo: true,
      $expr: { $lte: ['$stockActual', '$stockMinimo'] }
    });
    
    // Productos próximos a vencer (30 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);
    
    const proximosVencer = await Lote.countDocuments({
      fechaVencimiento: { $lte: fechaLimite, $gte: new Date() },
      cantidadDisponible: { $gt: 0 }
    });
    
    // Entradas del día
    const entradasHoy = await Entrada.countDocuments({
      fecha: { $gte: hoy }
    });
    
    // Salidas del día
    const salidasHoy = await Salida.countDocuments({
      fecha: { $gte: hoy }
    });
    
    // Últimas entradas
    const ultimasEntradas = await Entrada.find()
      .populate('producto', 'nombre')
      .populate('proveedor', 'nombre')
      .sort({ fecha: -1 })
      .limit(5);
    
    // Últimas salidas
    const ultimasSalidas = await Salida.find()
      .populate('producto', 'nombre')
      .sort({ fecha: -1 })
      .limit(5);
    
    res.json({
      success: true,
      estadisticas: {
        stockCritico,
        proximosVencer,
        entradasHoy,
        salidasHoy
      },
      ultimasEntradas,
      ultimasSalidas
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;