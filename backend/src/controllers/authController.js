// backend/src/controllers/authController.js
const Usuario = require('../models/Usuario');
const HistorialLog = require('../models/HistorialLog');
const jwt = require('jsonwebtoken');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });
};

exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor ingrese email y contraseña'
      });
    }

    // ✅ NORMALIZAR EMAIL (esto arregla el 80% de los "credenciales inválidas")
    email = String(email).trim().toLowerCase();

    // Buscar usuario
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña (NO hacemos trim aquí para no romper contraseñas con espacios intencionales)
    const esValida = await usuario.compararPassword(password);

    if (!esValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = Date.now();
    await usuario.save({ validateBeforeSave: false });

    // Registrar login
    await HistorialLog.create({
      usuario: usuario._id,
      accion: 'Login',
      modulo: 'Sistema',
      descripcion: 'Inicio de sesión exitoso',
      ip: req.ip || req.connection.remoteAddress
    });

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id);

    res.json({
      success: true,
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
        ultimoAcceso: usuario.ultimoAcceso
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ IMPORTANTE: este endpoint lo estás usando desde el frontend (authService.actualizarPerfil)
exports.actualizarPerfil = async (req, res, next) => {
  try {
    const { nombreCompleto, email } = req.body;

    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    if (nombreCompleto !== undefined) usuario.nombreCompleto = nombreCompleto;

    if (email !== undefined) {
      const emailNorm = String(email).trim().toLowerCase();

      // si cambia email, validar que no exista
      if (emailNorm !== usuario.email) {
        const existe = await Usuario.findOne({ email: emailNorm });
        if (existe) {
          return res.status(400).json({ success: false, mensaje: 'El email ya está registrado' });
        }
      }

      usuario.email = emailNorm;
    }

    await usuario.save();

    res.json({
      success: true,
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    const usuario = await Usuario.findById(req.usuario._id).select('+password');

    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const esValida = await usuario.compararPassword(passwordActual);

    if (!esValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.password = passwordNueva;
    await usuario.save(); // ✅ aquí se dispara el pre('save') del hash

    res.json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};