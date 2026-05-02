// frontend/src/services/proveedorService.js
import api from "./api";

export const proveedorService = {
  obtenerProveedores: async () => {
    const res = await api.get("/proveedores");

    // Soporta ambos formatos:
    // A) { success: true, proveedores: [...] }
    // B) { ok: true, data: [...] }
    const proveedores = res?.data?.proveedores || res?.data?.data || [];

    return Array.isArray(proveedores) ? proveedores : [];
  },

  obtenerProveedoresActivos: async () => {
    const proveedores = await proveedorService.obtenerProveedores();
    return proveedores.filter((p) => p?.activo !== false);
  },
};
