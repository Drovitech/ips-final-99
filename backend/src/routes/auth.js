// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validarCampos } = require("../middleware/validator");
const { loginLimiter } = require("../middleware/security");

router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Contraseña requerida"),
  ],
  validarCampos,
  authController.login
);

router.get("/perfil", protect, authController.obtenerPerfil);

// ✅ NUEVO: actualizar perfil
router.put(
  "/perfil",
  protect,
  [
    body("nombreCompleto").optional().notEmpty().withMessage("Nombre completo no puede estar vacío"),
    body("email").optional().isEmail().withMessage("Email inválido"),
  ],
  validarCampos,
  authController.actualizarPerfil
);

router.put(
  "/cambiar-password",
  protect,
  [
    body("passwordActual").notEmpty().withMessage("Contraseña actual requerida"),
    body("passwordNueva")
      .isLength({ min: 8 })
      .withMessage("La nueva contraseña debe tener al menos 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("La contraseña debe contener mayúsculas, minúsculas y números"),
  ],
  validarCampos,
  authController.cambiarPassword
);

module.exports = router;
