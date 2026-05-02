// frontend/src/components/auth/RutaProtegida.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ✅ Normaliza texto: minúsculas + sin tildes + sin espacios raros
const normalizar = (txt = "") =>
  String(txt)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes

const RutaProtegida = ({ children, permisosRequeridos = [] }) => {
  const { estaAutenticado, usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si exige roles
  if (permisosRequeridos.length > 0) {
    const rolUsuario = normalizar(usuario?.rol || "");
    const rolesPermitidos = permisosRequeridos.map(normalizar);

    const tienePermiso = rolesPermitidos.includes(rolUsuario);

    if (!tienePermiso) {
      return <Navigate to="/no-autorizado" replace />;
    }
  }

  return children;
};

export default RutaProtegida;
