// frontend/src/services/reporteService.js
import api from "./api";

export const reporteService = {
  // Movimientos (entradas + salidas)
  // params opcionales: fechaInicio, fechaFin, tipo: 'entradas' | 'salidas'
  obtenerMovimientos: async (params = {}) => {
    const res = await api.get("/reportes/movimientos", { params });
    // backend responde { success: true, datos: [...] }
    return res.data;
  },

  // Inventario actual
  obtenerInventario: async () => {
    const res = await api.get("/reportes/inventario");
    // backend responde { success: true, productos: [...] }
    return res.data;
  },
};
