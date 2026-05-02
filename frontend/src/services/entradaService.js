// frontend/src/services/entradaService.js
import api from "./api";

export const entradaService = {
  async obtenerEntradas({ fechaInicio, fechaFin, page = 1, limit = 10 } = {}) {
    const params = { page, limit };
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const res = await api.get("/entradas", { params });
    return res.data;
  },

  async crearEntrada(payload) {
    const res = await api.post("/entradas", payload);
    return res.data;
  },
};
