// backend/src/models/Salida.js
const mongoose = require("mongoose");

const salidaSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },

    // SALIDA o PRESTAMO
    tipo: {
      type: String,
      enum: ["SALIDA", "PRESTAMO"],
      required: true,
    },

    // fecha de salida
    fecha: {
      type: Date,
      default: Date.now,
    },

    // solo si es PRESTAMO
    fechaDevolucion: {
      type: Date,
      default: null,
    },

    responsable: {
      type: String,
      trim: true,
      default: "",
    },

    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salida", salidaSchema);
