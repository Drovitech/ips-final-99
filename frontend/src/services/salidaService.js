// frontend/src/services/salidaService.js
import api from "./api";

// ✅ Helper: convierte cualquier formato del backend a un ARRAY de salidas
const normalizarListaSalidas = (data) => {
  if (!data) return [];

  // 1) Array directo
  if (Array.isArray(data)) return data;

  // 2) Formatos comunes
  if (Array.isArray(data.salidas)) return data.salidas;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.result)) return data.result;

  // 3) Paginación común (mongoose-paginate / similares)
  if (Array.isArray(data.salidas?.docs)) return data.salidas.docs;
  if (Array.isArray(data.docs)) return data.docs;

  return [];
};

export const salidaService = {
  /**
   * ✅ USO NORMAL (pantallas del sistema)
   * Devuelve OBJETO (como antes) para no romper tu UI.
   * Si el backend cambia formato, igual garantiza `salidas: []`.
   */
  async obtenerSalidas({ desde, hasta, tipo } = {}) {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (tipo) params.tipo = tipo;

    const res = await api.get("/salidas", { params });
    const data = res?.data;

    // Mantener respuesta original si ya trae estructura
    // pero garantizando que exista `salidas` como lista
    const lista = normalizarListaSalidas(data);

    // Si tu backend ya devuelve { success: true, salidas: [...] }
    // respetamos todo y solo "aseguramos" salidas.
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return {
        ...data,
        salidas: lista,
      };
    }

    // Si el backend devolvió array directo, lo envolvemos
    return {
      success: true,
      salidas: lista,
    };
  },

  /**
   * ✅ USO REPORTES
   * Devuelve directamente la LISTA lista para CSV/Excel
   */
  async obtenerSalidasLista({ desde, hasta, tipo } = {}) {
    const data = await this.obtenerSalidas({ desde, hasta, tipo });
    return data?.salidas || [];
  },

  async crearSalida(payload) {
    const res = await api.post("/salidas", payload);
    return res.data;
  },
};