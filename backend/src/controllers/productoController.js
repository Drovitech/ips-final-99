// backend/src/controllers/productoController.js
const Producto = require("../models/Producto");

const obtenerProductos = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    let query = { activo: true };

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { productoBase: { $regex: search, $options: "i" } },
        { variante: { $regex: search, $options: "i" } },
      ];
    }

    const productos = await Producto.find(query)
      .populate("categoria", "nombre")
      .populate("proveedor", "nombre")
      .sort({ createdAt: -1 });

    res.json({ productos });
  } catch (error) {
    console.error("obtenerProductos:", error);
    res.status(500).json({ mensaje: "Error obteniendo productos" });
  }
};

const crearProducto = async (req, res) => {
  try {
    const body = req.body;

    const base = (body.productoBase || "").trim();
    const varTxt = (body.variante || "").trim();
    const nombre = (body.nombre || `${base} - ${varTxt}`).trim();

    const nuevo = await Producto.create({
      ...body,
      nombre,
      stockMinimo: Number(body.stockMinimo),
      stockActual: Number(body.stockActual),
    });

    const producto = await Producto.findById(nuevo._id)
      .populate("categoria", "nombre")
      .populate("proveedor", "nombre");

    res.status(201).json({ producto });
  } catch (error) {
    console.error("crearProducto:", error);
    res
      .status(400)
      .json({ mensaje: error?.message || "Error creando producto" });
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id)
      .populate("categoria", "nombre")
      .populate("proveedor", "nombre");

    if (!producto) return res.status(404).json({ mensaje: "No encontrado" });

    res.json({ producto });
  } catch (error) {
    console.error("obtenerProductoPorId:", error);
    res.status(500).json({ mensaje: "Error obteniendo producto" });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const base = (body.productoBase || "").trim();
    const varTxt = (body.variante || "").trim();
    const nombre = (body.nombre || `${base} - ${varTxt}`).trim();

    const producto = await Producto.findByIdAndUpdate(
      id,
      {
        ...body,
        nombre,
        stockMinimo:
          body.stockMinimo !== undefined ? Number(body.stockMinimo) : undefined,
        stockActual:
          body.stockActual !== undefined ? Number(body.stockActual) : undefined,
      },
      { new: true }
    )
      .populate("categoria", "nombre")
      .populate("proveedor", "nombre");

    if (!producto) return res.status(404).json({ mensaje: "No encontrado" });

    res.json({ producto });
  } catch (error) {
    console.error("actualizarProducto:", error);
    res
      .status(400)
      .json({ mensaje: error?.message || "Error actualizando producto" });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!producto) return res.status(404).json({ mensaje: "No encontrado" });

    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    console.error("eliminarProducto:", error);
    res.status(500).json({ mensaje: "Error eliminando producto" });
  }
};

module.exports = {
  obtenerProductos,
  crearProducto,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
};
