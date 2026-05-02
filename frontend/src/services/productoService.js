// frontend/src/services/productoService.js
import api from "./api";

export const productoService = {
  // ✅ Listar productos (con búsqueda opcional)
  obtenerProductos: async ({ search = "" } = {}) => {
    const res = await api.get("/productos", {
      params: { search },
    });

    // normalmente backend devuelve algo tipo:
    // { success: true, productos: [...] }
    return res.data;
  },

  // ✅ Obtener 1 producto por id (por si lo necesitas en editar)
  obtenerProducto: async (id) => {
    const res = await api.get(`/productos/${id}`);
    return res.data;
  },

  // ✅ Crear producto
  crearProducto: async (payload) => {
    const res = await api.post("/productos", payload);
    return res.data;
  },

  // ✅ Actualizar producto
  actualizarProducto: async (id, payload) => {
    const res = await api.put(`/productos/${id}`, payload);
    return res.data;
  },

  // ✅ Eliminar producto
  eliminarProducto: async (id) => {
    const res = await api.delete(`/productos/${id}`);
    return res.data;
  },
};
