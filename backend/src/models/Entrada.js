// backend/src/models/Entrada.js
const mongoose = require("mongoose");

const entradaSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      default: Date.now,
      required: true,
    },
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    lote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lote",
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    tipoIngreso: {
      type: String,
      required: true,
      enum: ["Compra", "Donación", "Ajuste", "Devolución", "Traslado"],
    },
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
      default: null,
    },
    numeroFactura: {
      type: String,
      default: "",
      trim: true,
    },
    valorUnitario: {
      type: Number,
      default: 0,
      min: 0,
    },
    valorTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    observaciones: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

entradaSchema.index({ fecha: -1 });

module.exports = mongoose.model("Entrada", entradaSchema);
