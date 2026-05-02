// backend/src/middleware/validator.js
const { validationResult } = require("express-validator");

exports.validarCampos = (req, res, next) => {
  const errors = validationResult(req);

  // ✅ si NO hay errores, seguimos normal
  if (errors.isEmpty()) return next();

  // ❌ si hay errores, devolvemos 400 con detalle
  return res.status(400).json({
    success: false,
    mensaje: "Error de validación",
    errores: errors.array(),
  });
};
