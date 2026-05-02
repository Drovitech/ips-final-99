// backend/src/routes/categorias.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const categoriaController = require('../controllers/categoriaController');

// ✅ ASÍ SE IMPORTA (igual que proveedores.js)
const { protect, authorize } = require('../middleware/auth');
const { validarCampos } = require('../middleware/validator');

// ===============================
// GET /api/categorias
// ===============================
router.get(
  '/',
  protect,
  categoriaController.obtenerCategorias
);

// ===============================
// POST /api/categorias
// ===============================
router.post(
  '/',
  protect,
  authorize('Administrador', 'Almacén', 'Farmacia'),
  [
    body('nombre').notEmpty().withMessage('Nombre requerido')
  ],
  validarCampos,
  categoriaController.crearCategoria
);

// ===============================
// DELETE /api/categorias/:id
// ===============================
router.delete(
  '/:id',
  protect,
  authorize('Administrador'),
  categoriaController.eliminarCategoria
);

module.exports = router;
