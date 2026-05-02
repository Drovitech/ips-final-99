// frontend/src/App.js
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RutaProtegida from "./components/auth/RutaProtegida";
import Layout from "./components/layout/Layout";

import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";

import ListaProductos from "./components/productos/ListaProductos";
import NuevoProducto from "./components/productos/NuevoProducto";
import EditarProducto from "./components/productos/EditarProducto";

import ListaEntradas from "./components/entradas/ListaEntradas";
import NuevaEntrada from "./components/entradas/NuevaEntrada";
import ListaSalidas from "./components/salidas/ListaSalidas";
import NuevaSalida from "./components/salidas/NuevaSalida";

import ListaProveedores from "./components/proveedores/ListaProveedores";
import ProveedorNuevo from "./components/proveedores/ProveedorNuevo";
import EditarProveedor from "./components/proveedores/EditarProveedores";

import Reportes from "./components/reportes/Reportes";
import ListaUsuarios from "./components/usuarios/ListaUsuarios";
import Configuracion from "./components/configuracion/Configuracion";

import StockMuebles from "./components/muebles/StockMuebles";
import NuevoMueble from "./components/muebles/NuevoMueble";
import EditarMueble from "./components/muebles/EditarMueble";

// ✅ PERFIL
import Perfil from "./components/perfil/Perfil";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Home */}
        <Route
          path="/"
          element={
            <RutaProtegida>
              <Navigate to="/dashboard" replace />
            </RutaProtegida>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Layout>
                <Dashboard />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* ✅ Perfil (UNA SOLA VEZ) */}
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <Layout>
                <Perfil />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Productos */}
        <Route
          path="/productos"
          element={
            <RutaProtegida>
              <Layout>
                <ListaProductos />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/productos/nuevo"
          element={
            <RutaProtegida>
              <Layout>
                <NuevoProducto />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/productos/editar/:id"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <EditarProducto />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Entradas */}
        <Route
          path="/entradas"
          element={
            <RutaProtegida>
              <Layout>
                <ListaEntradas />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/entradas/nueva"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <NuevaEntrada />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Salidas */}
        <Route
          path="/salidas"
          element={
            <RutaProtegida>
              <Layout>
                <ListaSalidas />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/salidas/nueva"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén", "enfermería"]}>
              <Layout>
                <NuevaSalida />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Proveedores */}
        <Route
          path="/proveedores"
          element={
            <RutaProtegida>
              <Layout>
                <ListaProveedores />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/proveedores/nuevo"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <ProveedorNuevo />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/proveedores/:id/editar"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <EditarProveedor />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Reportes */}
        <Route
          path="/reportes"
          element={
            <RutaProtegida>
              <Layout>
                <Reportes />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Muebles */}
        <Route
          path="/muebles"
          element={
            <RutaProtegida>
              <Layout>
                <StockMuebles />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/muebles/nuevo"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <NuevoMueble />
              </Layout>
            </RutaProtegida>
          }
        />

        <Route
          path="/muebles/:id/editar"
          element={
            <RutaProtegida permisosRequeridos={["Administrador", "Almacén"]}>
              <Layout>
                <EditarMueble />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Usuarios */}
        <Route
          path="/usuarios"
          element={
            <RutaProtegida permisosRequeridos={["Administrador"]}>
              <Layout>
                <ListaUsuarios />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* Configuración */}
        <Route
          path="/configuracion"
          element={
            <RutaProtegida permisosRequeridos={["Administrador"]}>
              <Layout>
                <Configuracion />
              </Layout>
            </RutaProtegida>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="text-center">
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <p className="fs-4">Página no encontrada</p>
                <a href="/" className="btn btn-primary">
                  Volver al inicio
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
