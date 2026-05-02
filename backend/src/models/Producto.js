// backend/src/models/Producto.js
const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    productoBase: {
      type: String,
      required: [true, "El producto base es obligatorio"],
      trim: true
    },

    variante: {
      type: String,
      required: [true, "La variante es obligatoria"],
      trim: true
    },

    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true
    },

    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "La categoría es obligatoria"]
    },

    tipoServicio: {
      type: String,
      required: [true, "El servicio es obligatorio"],
      trim: true
    },

    tipoProducto: {
      type: String,
      required: [true, "El tipo de producto es obligatorio"],
      trim: true
    },

    unidadMedida: {
      type: String,
      required: [true, "La unidad de medida es obligatoria"],
      enum: ["Unidad", "Caja", "Frasco", "Ampolla", "Sobre", "Kit", "Mililitro", "Gramo", "Bolsa"]
    },

    stockMinimo: {
      type: Number,
      required: [true, "El stock mínimo es obligatorio"],
      min: 0,
      set: (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
    },

    // ✅ Producto = definición: stockActual NO es obligatorio
    stockActual: {
      type: Number,
      default: 0,
      min: 0,
      set: (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
    },

    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
      required: [true, "El proveedor es obligatorio"]
    },

    registroSanitario: {
      type: String,
      default: ""
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

productoSchema.index({
  nombre: "text",
  productoBase: "text",
  variante: "text"
});

productoSchema.index(
  { productoBase: 1, variante: 1, proveedor: 1, unidadMedida: 1 },
  { unique: true, partialFilterExpression: { activo: true } }
);

module.exports = mongoose.model("Producto", productoSchema);
