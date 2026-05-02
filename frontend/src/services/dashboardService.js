// frontend/src/services/dashboardService.js
import api from "./api";

export const dashboardService = {
  obtenerEstadisticas: async () => {
    const response = await api.get("/dashboard/estadisticas");
    return response.data;
  },
};
