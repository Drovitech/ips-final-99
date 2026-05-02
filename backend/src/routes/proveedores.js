// backend/src/routes/proveedores.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { protect, authorize, registrarLog } = require("../middleware/auth");
const { validarCampos } = require("../middleware/validator");

const Proveedor = require("../models/Proveedor");

// ✅ GET /api/proveedores  -> listar proveedores activos
router.get("/", protect, async (req, res, next) => {
  try {
    const proveedores = await Proveedor.find().sort({ nombre: 1 });

    res.json({
      success: true,
      proveedores,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ GET /api/proveedores/:id -> obtener proveedor por ID (esto te falta)
router.get("/:id", protect, async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);

    if (!proveedor) {
      return res.status(404).json({
        success: false,
        mensaje: "Proveedor no encontrado",
      });
    }

    res.json({
      success: true,
      proveedor,
    });
  } catch (error) {
    next(error);
  }
});

// ✅ POST /api/proveedores -> crear proveedor
router.post(
  "/",
  protect,
  authorize("Administrador", "Almacén"),
  [body("nombre").notEmpty().withMessage("Nombre requerido"), body("nit").notEmpty().withMessage("NIT requerido")],
  validarCampos,
  registrarLog("Proveedores", "Crear"),
  async (req, res, next) => {
    try {
      const existeNit = await Proveedor.findOne({ nit: req.body.nit });
      if (existeNit) {
        return res.status(409).json({
          success: false,
          mensaje: "Ya existe un proveedor con ese NIT",
        });
      }

      const proveedor = await Proveedor.create(req.body);

      res.status(201).json({
        success: true,
        mensaje: "Proveedor creado correctamente",
        proveedor,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ✅ PUT /api/proveedores/:id -> actualizar proveedor (para editar)
router.put(
  "/:id",
  protect,
  authorize("Administrador", "Almacén"),
  [body("nombre").notEmpty().withMessage("Nombre requerido"), body("nit").notEmpty().withMessage("NIT requerido")],
  validarCampos,
  registrarLog("Proveedores", "Actualizar"),
  async (req, res, next) => {
    try {
      // evitar conflicto de NIT con otro proveedor
      const existeNit = await Proveedor.findOne({
        nit: req.body.nit,
        _id: { $ne: req.params.id },
      });

      if (existeNit) {
        return res.status(409).json({
          success: false,
          mensaje: "Otro proveedor ya tiene ese NIT",
        });
      }

      const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!proveedor) {
        return res.status(404).json({
          success: false,
          mensaje: "Proveedor no encontrado",
        });
      }

      res.json({
        success: true,
        mensaje: "Proveedor actualizado correctamente",
        proveedor,
      });
    } catch (error) {
      next(error);
    }
  }
);
// ✅ DELETE /api/proveedores/:id -> eliminar proveedor (SOLO ADMIN)
router.delete(
  "/:id",
  protect,
  authorize("Administrador"),
  registrarLog("Proveedores", "Eliminar"),
  async (req, res, next) => {
    try {
      const proveedor = await Proveedor.findByIdAndDelete(req.params.id);

      if (!proveedor) {
        return res.status(404).json({
          success: false,
          mensaje: "Proveedor no encontrado",
        });
      }

      res.json({
        success: true,
        mensaje: "Proveedor eliminado correctamente",
      });
    } catch (error) {
      next(error);
    }
  }
);
// GET /api/proveedores  -> listar proveedores (solo activos por defecto)
router.get("/", protect, async (req, res, next) => {
  try {
    const incluirInactivos = String(req.query.incluirInactivos || "false") === "true";

    const filtro = incluirInactivos ? {} : { activo: true };

    const proveedores = await Proveedor.find(filtro).sort({ nombre: 1 });

    res.json({
      success: true,
      proveedores,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;