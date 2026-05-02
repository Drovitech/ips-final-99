// backend/src/models/Lote.js
const mongoose = require('mongoose');

const loteSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  numeroLote: {
    type: String,
    required: true,
    trim: true
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  cantidadDisponible: {
    type: Number,
    required: true,
    min: 0
  },
  numeroSerie: String,
  estado: {
    type: String,
    enum: ['Disponible', 'Próximo a vencer', 'Vencido', 'Agotado'],
    default: 'Disponible'
  }
}, {
  timestamps: true
});

loteSchema.index({ fechaVencimiento: 1 });

module.exports = mongoose.model('Lote', loteSchema);