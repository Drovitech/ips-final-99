// frontend/src/services/loteService.js
import api from "./api";

export const loteService = {
  // GET /api/lotes?producto=...
  async obtenerLotes(params = {}) {
    const res = await api.get("/lotes", { params });
    return res.data; // { ok: true, lotes: [...] }
  },

  // POST /api/lotes
  async crearLote(payload) {
    const res = await api.post("/lotes", payload);
    return res.data; 
    // ideal: { ok: true, mensaje: "...", lote: {...} }
  },
};
