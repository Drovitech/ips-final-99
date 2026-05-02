// frontend/src/services/categoriaService.js
import api from "./api";

export const categoriaService = {
  obtenerCategorias: async () => {
    const res = await api.get("/categorias");
    return res.data?.categorias || [];
  },

  crearCategoria: async (nombre, descripcion = "") => {
    const res = await api.post("/categorias", { nombre, descripcion });
    return res.data?.categoria;
  },

  eliminarCategoria: async (id) => {
    const res = await api.delete(`/categorias/${id}`);
    return res.data;
  }
};

