// frontend/src/services/configuracionService.js
import api from "./api";

export const configuracionService = {
  async obtenerInfoIps() {
    const res = await api.get("/info-ips");
    return res.data;
  },

  async obtenerEstadoSistema() {
    const res = await api.get("/health");
    return res.data;
  },
};