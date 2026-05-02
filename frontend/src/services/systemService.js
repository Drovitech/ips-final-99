// frontend/src/services/systemService.js
import api from "./api";

export const systemService = {
  async obtenerEstado() {
    const res = await api.get("/system/status");
    return res.data;
  },
};