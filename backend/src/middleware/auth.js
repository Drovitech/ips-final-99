// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const HistorialLog = require("../models/HistorialLog");

// ✅ Normaliza: minúsculas + sin tildes + trim
const normalizar = (txt = "") =>
  String(txt)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes

// ==========================
// PROTECT: valida JWT y carga usuario
// ==========================
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: "No autorizado. Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (!usuario || usuario.activo === false) {
      return res.status(401).json({
        success: false,
        mensaje: "Usuario no encontrado o inactivo",
      });
    }

    req.usuario = usuario;
    req.user = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      mensaje: "Token inválido o expirado",
    });
  }
};

// ==========================
// AUTHORIZE: valida roles
// ==========================
exports.authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rol = req.usuario?.rol || req.user?.rol;

    if (!rol) {
      return res.status(401).json({
        success: false,
        mensaje: "No autorizado. No hay usuario en la petición",
      });
    }

    const rolNorm = normalizar(rol);
    const permitidos = rolesPermitidos.map(normalizar);

    // ✅ Regla extra: si contiene "administrador", cuenta como admin
    const esAdminPorNombre = rolNorm.includes("administrador");
    const pidenAdmin = permitidos.includes("administrador");

    const permitidoDirecto = permitidos.includes(rolNorm);
    const permitidoAdmin = pidenAdmin && esAdminPorNombre;

    if (!permitidoDirecto && !permitidoAdmin) {
      return res.status(403).json({
        success: false,
        mensaje: `El rol ${rol} no tiene permiso para esta acción`,
      });
    }

    next();
  };
};

// ==========================
// registrarLog: guarda logs si success/ok true
// ==========================
exports.registrarLog = (modulo, accion) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      const fueExitoso = data?.success === true || data?.ok === true;

      if (fueExitoso) {
        try {
          const userId = req.usuario?._id || req.user?._id;
          if (userId) {
            await HistorialLog.create({
              usuario: userId,
              accion,
              modulo,
              descripcion: `${accion} en ${modulo}`,
              datosNuevos: req.body,
              ip: req.ip,
            });
          }
        } catch (err) {
          console.error("Error al registrar log:", err);
        }
      }

      return originalJson(data);
    };

    next();
  };
};
