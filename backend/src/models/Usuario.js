// backend/src/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 8,
    select: false
  },
  rol: {
    type: String,
    enum: ['Administrador', 'Enfermería', 'Almacén', 'Farmacia', 'Auditor'],
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimoAcceso: Date
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // Trim defensivo (evita espacios accidentales)
  if (typeof this.password === 'string') {
    this.password = this.password.trim();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
