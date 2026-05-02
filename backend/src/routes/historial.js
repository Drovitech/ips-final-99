// backend/src/routes/historial.js
// ============================================
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const HistorialLog = require('../models/HistorialLog');

// Obtener historial (admin y auditor)
router.get('/', 
  protect, 
  authorize('Administrador', 'Auditor'), 
  async (req, res, next) => {
    try {
      const { page = 1, limit = 50, modulo, usuario } = req.query;
      
      const filtro = {};
      if (modulo) filtro.modulo = modulo;
      if (usuario) filtro.usuario = usuario;
      
      const historial = await HistorialLog.find(filtro)
        .populate('usuario', 'nombreCompleto email rol')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      
      const total = await HistorialLog.countDocuments(filtro);
      
      res.json({
        success: true,
        historial,
        totalPaginas: Math.ceil(total / limit),
        paginaActual: page
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;