// backend/src/models/Proveedor.js
const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    nit: {
      type: String,
      required: [true, "El NIT es obligatorio"],
      trim: true,
      unique: true,
      index: true,
    },
    telefono: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    direccion: {
      type: String,
      trim: true,
      default: "",
    },
    contacto: {
      type: String,
      trim: true,
      default: "",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Asegura el índice único (recomendado)
proveedorSchema.index({ nit: 1 }, { unique: true });

module.exports = mongoose.model("Proveedor", proveedorSchema);