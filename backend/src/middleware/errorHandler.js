// backend/src/middleware/errorHandler.js
// ============================================
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(e => ({
      campo: e.path,
      mensaje: e.message
    }));
    
    return res.status(400).json({
      success: false,
      mensaje: 'Error de validación',
      errores
    });
  }
  
  // Error de duplicado
  if (err.code === 11000) {
    const campo = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      mensaje: `El ${campo} ya existe en el sistema`
    });
  }
  
  // Error de casting (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      mensaje: 'ID inválido'
    });
  }
  
  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    mensaje: err.message || 'Error interno del servidor'
  });
};