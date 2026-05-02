// backend/src/models/HistorialLog.js
const mongoose = require('mongoose');

const historialLogSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  accion: {
    type: String,
    required: true,
    enum: ['Crear', 'Actualizar', 'Eliminar', 'Login', 'Logout']
  },
  modulo: {
    type: String,
    required: true,
    enum: ['Productos', 'Entradas', 'Salidas', 'Proveedores', 'Usuarios', 'Reportes', 'Sistema']
  },
  descripcion: {
    type: String,
    required: true
  },
  datosAnteriores: mongoose.Schema.Types.Mixed,
  datosNuevos: mongoose.Schema.Types.Mixed,
  ip: String
}, {
  timestamps: true
});

historialLogSchema.index({ createdAt: -1 });
historialLogSchema.index({ usuario: 1, createdAt: -1 });

module.exports = mongoose.model('HistorialLog', historialLogSchema);