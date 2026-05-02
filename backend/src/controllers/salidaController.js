// backend/src/controllers/salidaController.js
const Salida = require("../models/Salida");
const Producto = require("../models/Producto");

// GET /api/salidas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&tipo=TODOS|SALIDA|PRESTAMO
exports.obtenerSalidas = async (req, res, next) => {
  try {
    const { desde, hasta, tipo } = req.query;

    const filtro = {};

    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) {
        const fin = new Date(hasta);
        fin.setHours(23, 59, 59, 999);
        filtro.fecha.$lte = fin;
      }
    }

    if (tipo && tipo !== "TODOS") {
      filtro.tipo = tipo;
    }

    const salidas = await Salida.find(filtro)
      .populate("producto", "nombre productoBase variante unidadMedida stockActual")
      .populate("usuario", "nombreCompleto rol")
      .sort({ createdAt: -1 });

    res.json({ ok: true, salidas });
  } catch (error) {
    next(error);
  }
};

// POST /api/salidas
exports.crearSalida = async (req, res, next) => {
  try {
    const { producto, cantidad, tipo, fechaDevolucion, responsable } = req.body;

    // ✅ agarra el id del usuario venga como venga (req.user, req.usuario, etc.)
    const userId =
      req.user?._id ||
      req.usuario?._id ||
      req.userId ||
      req.user?.id ||
      null;

    if (!userId) {
      return res.status(401).json({ ok: false, mensaje: "No autorizado (sin usuario en sesión)." });
    }

    if (!producto) {
      return res.status(400).json({ ok: false, mensaje: "Producto es obligatorio" });
    }

    const cant = Number(cantidad);
    if (!cant || cant <= 0) {
      return res.status(400).json({ ok: false, mensaje: "Cantidad inválida" });
    }

    if (!["SALIDA", "PRESTAMO"].includes(tipo)) {
      return res.status(400).json({ ok: false, mensaje: "Tipo inválido" });
    }

    if (tipo === "PRESTAMO" && !fechaDevolucion) {
      return res.status(400).json({
        ok: false,
        mensaje: "Fecha de devolución es obligatoria para préstamo",
      });
    }

    // ✅ Descontar stock SIN transacciones (atómico)
    // Solo descuenta si hay stock suficiente
    const prodActualizado = await Producto.findOneAndUpdate(
      { _id: producto, stockActual: { $gte: cant } },
      { $inc: { stockActual: -cant } },
      { new: true }
    );

    if (!prodActualizado) {
      // si no pudo actualizar, puede ser que no exista o no haya stock
      const existe = await Producto.exists({ _id: producto });

      if (!existe) {
        return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
      }

      return res.status(400).json({
        ok: false,
        mensaje: "Stock insuficiente para registrar la salida",
      });
    }

    // ✅ Crear salida
    const salida = await Salida.create({
      producto: prodActualizado._id,
      cantidad: cant,
      tipo,
      fechaDevolucion: tipo === "PRESTAMO" ? new Date(fechaDevolucion) : null,
      responsable: responsable ? String(responsable).trim() : "",
      usuario: userId,
    });

    const salidaCreada = await Salida.findById(salida._id)
      .populate("producto", "nombre productoBase variante unidadMedida stockActual")
      .populate("usuario", "nombreCompleto rol");

    res.status(201).json({
      ok: true,
      mensaje: "Salida registrada correctamente",
      salida: salidaCreada,
      stockNuevo: prodActualizado.stockActual,
    });
  } catch (error) {
    next(error);
  }
};
