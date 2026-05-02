// frontend/src/components/proveedores/ListaProveedores.js
// ============================================
import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import { FiPlus, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { tienePermiso } from "../../utils/permisos";

const ListaProveedores = () => {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    cargarProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarProveedores = async () => {
    try {
      setCargando(true);
      const response = await api.get("/proveedores");

      // ✅ Soporta ambos formatos:
      // - { success: true, proveedores: [...] }
      // - { ok: true, data: [...] }
      const lista = response?.data?.proveedores || response?.data?.data || [];
      setProveedores(lista);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    } finally {
      setCargando(false);
    }
  };

  const irANuevoProveedor = () => {
    navigate("/proveedores/nuevo");
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Proveedores</h2>

        {tienePermiso(usuario, "proveedores", "crear") && (
          <Button variant="primary" onClick={irANuevoProveedor}>
            <FiPlus className="me-2" />
            Nuevo Proveedor
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Nombre</th>
                  <th>NIT</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  {tienePermiso(usuario, "proveedores", "editar") && (
                    <th>Acciones</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        tienePermiso(usuario, "proveedores", "editar") ? 7 : 6
                      }
                      className="text-center py-4 text-muted"
                    >
                      No hay proveedores registrados
                    </td>
                  </tr>
                ) : (
                  proveedores.map((proveedor) => (
                    <tr key={proveedor._id}>
                      <td className="fw-semibold">{proveedor.nombre}</td>
                      <td>{proveedor.nit}</td>
                      <td>{proveedor.telefono || "-"}</td>
                      <td>{proveedor.email || "-"}</td>
                      <td>{proveedor.contacto || "-"}</td>
                      <td>
                        <Badge bg={proveedor.activo ? "success" : "secondary"}>
                          {proveedor.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>

                      {tienePermiso(usuario, "proveedores", "editar") && (
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              navigate(`/proveedores/${proveedor._id}/editar`)
                            }
                            title="Editar proveedor"
                          >
                            <FiEdit />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListaProveedores;