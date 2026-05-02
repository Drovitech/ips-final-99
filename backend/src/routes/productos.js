// backend/src/routes/productos.js
const router = require("express").Router();
const {
  obtenerProductos,
  crearProducto,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");

// GET /api/productos?search=
router.get("/", obtenerProductos);

// POST /api/productos
router.post("/", crearProducto);

// GET /api/productos/:id
router.get("/:id", obtenerProductoPorId);

// PUT /api/productos/:id
router.put("/:id", actualizarProducto);

// DELETE /api/productos/:id
router.delete("/:id", eliminarProducto);

module.exports = router;
