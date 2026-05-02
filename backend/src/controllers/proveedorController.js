// backend/src/controllers/productoController.js
const Producto = require("../models/Producto");

exports.crearProducto = async (req, res, next) => {
  try {
    const {
      productoBase,
      variante,
      nombre,
      categoria,
      tipoServicio,
      tipoProducto,
      unidadMedida,
      stockMinimo,
      proveedor,
      registroSanitario,
      activo
    } = req.body;

    // ✅ nombre final si no llega
    const nombreFinal =
      (nombre && String(nombre).trim()) ||
      `${String(productoBase || "").trim()} - ${String(variante || "").trim()}`.trim();

    const nuevo = await Producto.create({
      productoBase,
      variante,
      nombre: nombreFinal,
      categoria,
      tipoServicio,
      tipoProducto,
      unidadMedida,
      stockMinimo: Number.isFinite(Number(stockMinimo)) ? Number(stockMinimo) : 0,
      // ✅ NO stockActual aquí (queda en 0 por default)
      proveedor,
      registroSanitario: registroSanitario || "",
      activo: typeof activo === "boolean" ? activo : true
    });

    res.status(201).json({
      success: true,
      mensaje: "Producto creado correctamente",
      producto: nuevo
    });
  } catch (error) {
    next(error);
  }
};
