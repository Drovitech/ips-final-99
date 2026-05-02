// backend/src/models/Categoria.js
const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    unique: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

categoriaSchema.index({ nombre: 1 });

module.exports = mongoose.model('Categoria', categoriaSchema);


