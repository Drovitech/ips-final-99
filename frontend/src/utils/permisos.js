// frontend/src/utils/permisos.js

// ✅ Normaliza texto: minúsculas + sin tildes
const normalizar = (txt = "") =>
  String(txt)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ✅ OJO: dejamos claves SIN tildes para evitar bugs de comparación
export const PERMISOS = {
  administrador: {
    productos: ["ver", "crear", "editar", "eliminar"],
    entradas: ["ver", "crear", "editar"],
    salidas: ["ver", "crear", "editar"],
    proveedores: ["ver", "crear", "editar", "eliminar"],
    usuarios: ["ver", "crear", "editar", "eliminar"],
    reportes: ["ver", "exportar"],
    ajustes: ["ver", "editar"],
  },
  enfermeria: {
    productos: ["ver"],
    entradas: ["ver"],
    salidas: ["ver", "crear"],
    proveedores: ["ver"],
    reportes: ["ver"],
  },
  almacen: {
    productos: ["ver", "crear", "editar"],
    entradas: ["ver", "crear", "editar"],
    salidas: ["ver", "crear"],
    proveedores: ["ver", "crear", "editar"],
    reportes: ["ver", "exportar"],
  },
  farmacia: {
    productos: ["ver", "crear", "editar"],
    entradas: ["ver", "crear"],
    salidas: ["ver", "crear"],
    proveedores: ["ver"],
    reportes: ["ver", "exportar"],
  },
  auditor: {
    productos: ["ver"],
    entradas: ["ver"],
    salidas: ["ver"],
    proveedores: ["ver"],
    reportes: ["ver", "exportar"],
    historial: ["ver"],
  },
};

export const tienePermiso = (usuario, modulo, accion) => {
  if (!usuario || !usuario.rol) return false;

  const rol = normalizar(usuario.rol);       // ej: "Enfermería" -> "enfermeria"
  const mod = normalizar(modulo);            // por si llega raro
  const act = normalizar(accion);

  const permisosRol = PERMISOS[rol];
  if (!permisosRol || !permisosRol[mod]) return false;

  return permisosRol[mod].includes(act);
};
