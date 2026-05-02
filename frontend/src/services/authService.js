// frontend/src/services/authService.js
import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "usuario";

export const authService = {
  async login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const { token, usuario } = res.data;

    this.guardarToken(token);
    this.guardarUsuarioActual(usuario);

    return res.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  estaAutenticado() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  obtenerUsuarioActual() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  guardarUsuarioActual(usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  guardarToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // ✅ GET perfil desde backend
  async obtenerPerfil() {
    const res = await api.get("/auth/perfil");
    return res.data;
  },

  // ✅ PUT perfil (ESTO requiere la ruta en backend)
  async actualizarPerfil(payload) {
    const res = await api.put("/auth/perfil", payload);
    // si el backend devuelve usuario actualizado, lo guardamos
    if (res?.data?.usuario) {
      this.guardarUsuarioActual(res.data.usuario);
    }
    return res.data;
  },

  // ✅ Cambiar contraseña real
  async cambiarPassword(payload) {
    const res = await api.put("/auth/cambiar-password", payload);
    return res.data;
  },
};