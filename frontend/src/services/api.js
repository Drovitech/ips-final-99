// frontend/src/services/api.js
// frontend/src/services/api.js
import axios from "axios";

// 🔥 BaseURL: ajusta si tu backend usa otro puerto/ruta
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * ✅ Obtener token "a prueba de balas"
 * Busca en localStorage y sessionStorage
 */
const getToken = () => {
  const storages = [localStorage, sessionStorage];

  // 1) claves comunes directas
  for (const st of storages) {
    const direct =
      st.getItem("token") ||
      st.getItem("authToken") ||
      st.getItem("accessToken") ||
      st.getItem("jwt");

    if (direct) return direct;
  }

  // 2) token dentro de objetos guardados
  const possibleUserKeys = ["usuario", "usuarioActual", "user", "currentUser"];

  for (const st of storages) {
    for (const key of possibleUserKeys) {
      const raw = st.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        const tokenInside =
          parsed?.token ||
          parsed?.accessToken ||
          parsed?.jwt ||
          parsed?.data?.token ||
          parsed?.data?.accessToken;

        if (tokenInside) return tokenInside;
      } catch (e) {
        // si no es JSON, ignoramos
      }
    }
  }

  return null;
};

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("usuario");
};

// Evita redirecciones repetidas
let isRedirecting = false;

// ✅ Interceptor: adjunta Authorization automáticamente
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor: si expira sesión -> limpiar y mandar a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    const mensaje = String(data?.mensaje || data?.message || "").toLowerCase();

    const esNoAutorizado = status === 401 || status === 403;

    const esSesionExpirada =
      esNoAutorizado &&
      (mensaje.includes("token") ||
        mensaje.includes("expir") ||
        mensaje.includes("jwt") ||
        mensaje.includes("no autorizado") ||
        mensaje.includes("unauthorized"));

    if (esSesionExpirada) {
      clearSession();

      if (!isRedirecting) {
        isRedirecting = true;

        // Evita loop si ya estás en login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=1";
        }

        setTimeout(() => {
          isRedirecting = false;
        }, 800);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

