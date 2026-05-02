// backend/src/controllers/entradaController.js
const Entrada = require("../models/Entrada");
const Producto = require("../models/Producto");
const Lote = require("../models/Lote");

exports.registrarEntrada = async (req, res, next) => {
  try {
    const { producto, lote, cantidad } = req.body;

    if (!producto) {
      return res.status(400).json({ success: false, mensaje: "Producto es obligatorio" });
    }
    if (!lote) {
      return res.status(400).json({ success: false, mensaje: "Lote es obligatorio" });
    }
    if (!cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ success: false, mensaje: "Cantidad inválida" });
    }

    // ✅ usuario siempre existe por protect()
    const usuarioId = req.usuario?._id || req.user?._id;

    // Crear entrada
    const entrada = await Entrada.create({
      ...req.body,
      cantidad: Number(cantidad),
      usuario: usuarioId,
    });

    // Actualizar stock del producto
    await Producto.findByIdAndUpdate(producto, {
      $inc: { stockActual: Number(cantidad) },
    });

    // Actualizar lote
    await Lote.findByIdAndUpdate(lote, {
      $inc: { cantidad: Number(cantidad), cantidadDisponible: Number(cantidad) },
    });

    const entradaCompleta = await Entrada.findById(entrada._id)
      .populate("producto", "nombre productoBase variante")
      .populate("lote", "numeroLote fechaVencimiento")
      .populate("usuario", "nombreCompleto rol");

    return res.status(201).json({
      success: true,
      mensaje: "Entrada registrada correctamente",
      entrada: entradaCompleta,
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerEntradas = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;

    const query = {};

    if (fechaInicio) query.fecha = { ...(query.fecha || {}), $gte: new Date(fechaInicio) };
    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      query.fecha = { ...(query.fecha || {}), $lte: fin };
    }

    const entradas = await Entrada.find(query)
      .populate("producto", "nombre productoBase variante categoria")
      .populate("lote", "numeroLote fechaVencimiento")
      .populate("usuario", "nombreCompleto")
      .populate("proveedor", "nombre")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ fecha: -1 });

    const total = await Entrada.countDocuments(query);

    return res.json({
      success: true,
      entradas,
      totalPaginas: Math.ceil(total / Number(limit)),
      paginaActual: Number(page),
    });
  } catch (error) {
    next(error);
  }
};
