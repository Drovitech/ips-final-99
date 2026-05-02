// backend/src/routes/usuarios.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize, registrarLog } = require('../middleware/auth');
const { validarCampos } = require('../middleware/validator');
const Usuario = require('../models/Usuario');

// ======================================================
// GET /api/usuarios/me - Obtener mi perfil (logueado)
// ======================================================
router.get('/me', protect, async (req, res, next) => {
  try {
    const userId = req.usuario?._id || req.user?.id || req.user?._id;

    const usuario = await Usuario.findById(userId).select('-password');
    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, usuario });
  } catch (error) {
    next(error);
  }
});

// =======================================================================
// PUT /api/usuarios/me - Actualizar mi perfil + cambiar contraseña
// Para cambiar contraseña requiere: passwordActual + nuevaPassword
// =======================================================================
router.put(
  '/me',
  protect,
  [
    body('nombreCompleto').optional().notEmpty().withMessage('Nombre completo no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('nuevaPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
  ],
  validarCampos,
  async (req, res, next) => {
    try {
      const userId = req.usuario?._id || req.user?.id || req.user?._id;
      const { nombreCompleto, email, passwordActual, nuevaPassword } = req.body;

      // OJO: necesitamos password para comparar si va a cambiar
      const usuario = await Usuario.findById(userId).select('+password');

      if (!usuario) {
        return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
      }

      if (nombreCompleto !== undefined) usuario.nombreCompleto = nombreCompleto;

      if (email !== undefined) {
        const emailNorm = String(email).trim().toLowerCase();

        if (emailNorm !== usuario.email) {
          const existe = await Usuario.findOne({ email: emailNorm });
          if (existe) {
            return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
          }
        }
        usuario.email = emailNorm;
      }

      // Cambiar contraseña (si envían nuevaPassword)
      if (nuevaPassword) {
        if (!passwordActual) {
          return res.status(400).json({ success: false, mensaje: 'Debes enviar la contraseña actual' });
        }

        const ok = await usuario.compararPassword(passwordActual);
        if (!ok) {
          return res.status(400).json({ success: false, mensaje: 'La contraseña actual es incorrecta' });
        }

        // texto plano -> el pre('save') la hashea una sola vez
        usuario.password = nuevaPassword;
      }

      await usuario.save();

      const usuarioSeguro = await Usuario.findById(userId).select('-password');

      res.json({
        success: true,
        mensaje: nuevaPassword
          ? 'Contraseña actualizada ✅ (recomendado: vuelve a iniciar sesión)'
          : 'Perfil actualizado correctamente ✅',
        usuario: usuarioSeguro
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// GET /api/usuarios - Obtener todos los usuarios
// ============================================
router.get(
  '/',
  protect,
  authorize('Administrador'),
  async (req, res, next) => {
    try {
      const usuarios = await Usuario.find()
        .select('-password')
        .sort({ nombreCompleto: 1 });

      res.json({ success: true, usuarios });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// GET /api/usuarios/:id - Obtener un usuario
// ============================================
router.get(
  '/:id',
  protect,
  authorize('Administrador'),
  async (req, res, next) => {
    try {
      const usuario = await Usuario.findById(req.params.id).select('-password');

      if (!usuario) {
        return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
      }

      res.json({ success: true, usuario });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// POST /api/usuarios - Crear usuario
// ============================================
router.post(
  '/',
  protect,
  authorize('Administrador'),
  [
    body('nombreCompleto').notEmpty().withMessage('Nombre completo requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
    body('rol')
      .isIn(['Administrador', 'Enfermería', 'Almacén', 'Farmacia', 'Auditor'])
      .withMessage('Rol inválido')
  ],
  validarCampos,
  registrarLog('Usuarios', 'Crear'),
  async (req, res, next) => {
    try {
      const emailNorm = String(req.body.email).trim().toLowerCase();

      const emailExiste = await Usuario.findOne({ email: emailNorm });
      if (emailExiste) {
        return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
      }

      // IMPORTANTE: NO hashear aquí. El modelo lo hace en pre('save')
      const usuario = await Usuario.create({
        ...req.body,
        email: emailNorm,
        password: req.body.password // texto plano aquí
      });

      res.status(201).json({
        success: true,
        mensaje: 'Usuario creado correctamente',
        usuario: {
          id: usuario._id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
      }
      next(error);
    }
  }
);

// ============================================
// PUT /api/usuarios/:id - Actualizar usuario
// ============================================
router.put(
  '/:id',
  protect,
  authorize('Administrador'),
  [
    body('nombreCompleto').optional().notEmpty().withMessage('Nombre completo no puede estar vacío'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
    body('rol')
      .optional()
      .isIn(['Administrador', 'Enfermería', 'Almacén', 'Farmacia', 'Auditor'])
      .withMessage('Rol inválido')
  ],
  validarCampos,
  registrarLog('Usuarios', 'Actualizar'),
  async (req, res, next) => {
    try {
      // necesitamos password si lo van a cambiar
      const usuario = await Usuario.findById(req.params.id).select('+password');

      if (!usuario) {
        return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
      }

      // prevenir cambiar email del admin principal
      if (usuario.email === 'admin@ipssalud.com' && req.body.email && req.body.email !== usuario.email) {
        return res.status(403).json({ success: false, mensaje: 'No se puede modificar el email del administrador principal' });
      }

      if (req.body.email && req.body.email !== usuario.email) {
        const emailNorm = String(req.body.email).trim().toLowerCase();
        const emailExiste = await Usuario.findOne({ email: emailNorm });
        if (emailExiste) {
          return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
        }
        usuario.email = emailNorm;
      }

      if (req.body.nombreCompleto) usuario.nombreCompleto = req.body.nombreCompleto;
      if (req.body.rol) usuario.rol = req.body.rol;
      if (req.body.activo !== undefined) usuario.activo = req.body.activo;

      // IMPORTANTE: si cambian password, se asigna en texto plano
      // y el pre('save') la hashea una sola vez.
      if (req.body.password) usuario.password = req.body.password;

      await usuario.save();

      res.json({
        success: true,
        mensaje: 'Usuario actualizado correctamente',
        usuario: {
          id: usuario._id,
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
      }
      next(error);
    }
  }
);

// ============================================
// DELETE /api/usuarios/:id - Eliminar usuario
// ============================================
router.delete(
  '/:id',
  protect,
  authorize('Administrador'),
  registrarLog('Usuarios', 'Eliminar'),
  async (req, res, next) => {
    try {
      const usuario = await Usuario.findById(req.params.id);

      if (!usuario) {
        return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
      }

      if (usuario.email === 'admin@ipssalud.com') {
        return res.status(403).json({ success: false, mensaje: 'No se puede eliminar el usuario administrador principal' });
      }

      const currentUserId = (req.usuario?._id || req.user?.id || req.user?._id)?.toString();
      if (usuario._id.toString() === currentUserId) {
        return res.status(403).json({ success: false, mensaje: 'No puedes eliminar tu propio usuario' });
      }

      await usuario.deleteOne();

      res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

