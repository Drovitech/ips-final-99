// backend/src/controllers/loteController.js
const Lote = require("../models/Lote");
const Producto = require("../models/Producto");

// GET /api/lotes?producto=PRODUCTO_ID
exports.obtenerLotes = async (req, res, next) => {
  try {
    const { producto } = req.query;

    const filtro = {};
    if (producto) filtro.producto = producto;

    const lotes = await Lote.find(filtro)
      .populate("producto", "nombre productoBase variante")
      .sort({ createdAt: -1 });

    res.json({ ok: true, lotes });
  } catch (error) {
    next(error);
  }
};

// POST /api/lotes
exports.crearLote = async (req, res, next) => {
  try {
    const { producto, numeroLote, fechaVencimiento, cantidad, numeroSerie } = req.body;

    if (!producto) return res.status(400).json({ ok: false, mensaje: "Producto es obligatorio" });
    if (!numeroLote || !String(numeroLote).trim())
      return res.status(400).json({ ok: false, mensaje: "Número de lote es obligatorio" });
    if (!fechaVencimiento) return res.status(400).json({ ok: false, mensaje: "Fecha de vencimiento es obligatoria" });

    const cant = Number(cantidad || 0);
    if (cant < 0) return res.status(400).json({ ok: false, mensaje: "Cantidad inválida" });

    const prod = await Producto.findById(producto);
    if (!prod) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });

    // Evitar lote duplicado por producto
    const existe = await Lote.findOne({
      producto,
      numeroLote: String(numeroLote).trim(),
    });

    if (existe) {
      return res.status(400).json({ ok: false, mensaje: "Ese número de lote ya existe para este producto" });
    }

    const lote = await Lote.create({
      producto,
      numeroLote: String(numeroLote).trim(),
      fechaVencimiento: new Date(fechaVencimiento),
      cantidad: cant,
      cantidadDisponible: cant,
      numeroSerie: numeroSerie ? String(numeroSerie).trim() : undefined,
      estado: "Disponible",
    });

    const loteCreado = await Lote.findById(lote._id).populate("producto", "nombre productoBase variante");

    res.status(201).json({
      ok: true,
      mensaje: "Lote creado correctamente",
      lote: loteCreado,
    });
  } catch (error) {
    next(error);
  }
};