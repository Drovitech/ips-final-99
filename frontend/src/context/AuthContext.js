// frontend/src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = authService.obtenerUsuarioActual();
    if (usuarioGuardado) setUsuario(usuarioGuardado);
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  // ✅ NUEVO: actualizar usuario en estado + localStorage
  const actualizarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    authService.guardarUsuarioActual(nuevoUsuario);
  };

  const value = {
    usuario,
    login,
    logout,
    actualizarUsuario,
    estaAutenticado: authService.estaAutenticado(),
    cargando,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};