// backend/src/routes/reportes.js
// ============================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Entrada = require('../models/Entrada.js');
const Salida = require('../models/Salida');
const Producto = require('../models/Producto');

// Reporte de movimientos
router.get('/movimientos', protect, async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, tipo } = req.query;
    
    const filtro = {};
    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }
    
    let datos = [];
    
    if (!tipo || tipo === 'entradas') {
      const entradas = await Entrada.find(filtro)
        .populate('producto', 'nombre categoria')
        .populate('usuario', 'nombreCompleto')
        .sort({ fecha: -1 });
      datos.push(...entradas.map(e => ({ ...e.toObject(), tipo: 'entrada' })));
    }
    
    if (!tipo || tipo === 'salidas') {
      const salidas = await Salida.find(filtro)
        .populate('producto', 'nombre categoria')
        .populate('usuario', 'nombreCompleto')
        .sort({ fecha: -1 });
      datos.push(...salidas.map(s => ({ ...s.toObject(), tipo: 'salida' })));
    }
    
    res.json({
      success: true,
      datos: datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    });
  } catch (error) {
    next(error);
  }
});

// Reporte de inventario actual
router.get('/inventario', protect, async (req, res, next) => {
  try {
    const productos = await Producto.find({ activo: true })
      .populate('proveedor', 'nombre')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      productos
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;