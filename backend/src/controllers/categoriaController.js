// backend/src/controllers/categoriaController.js
const Categoria = require('../models/Categoria');

exports.obtenerCategorias = async (req, res, next) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });

    res.json({
      success: true,
      categorias
    });
  } catch (error) {
    next(error);
  }
};

exports.crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    const existe = await Categoria.findOne({ nombre: nombre.trim() });
    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: 'La categoría ya existe'
      });
    }

    const categoria = await Categoria.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || ''
    });

    res.status(201).json({
      success: true,
      mensaje: 'Categoría creada correctamente',
      categoria
    });
  } catch (error) {
    next(error);
  }
};

exports.eliminarCategoria = async (req, res, next) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        mensaje: 'Categoría no encontrada'
      });
    }

    await categoria.deleteOne();

    res.json({
      success: true,
      mensaje: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};



