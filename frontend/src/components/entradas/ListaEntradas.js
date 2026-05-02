// frontend/src/components/entradas/ListaEntradas.js
import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

import { entradaService } from "../../services/entradaService";
import { formatearFechaHora, formatearNumero } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";
import { tienePermiso } from "../../utils/permisos";

const ListaEntradas = () => {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    page: 1,
  });

  const { usuario } = useAuth();

  useEffect(() => {
    cargarEntradas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const cargarEntradas = async () => {
    try {
      setCargando(true);
      const data = await entradaService.obtenerEntradas(filtros);
      setEntradas(data?.entradas || []);
    } catch (error) {
      console.error("Error al cargar entradas:", error);
      setEntradas([]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Entradas de Inventario</h2>

        {tienePermiso(usuario, "entradas", "crear") && (
          <Button as={Link} to="/entradas/nueva" variant="primary">
            <FiPlus className="me-2" />
            Nueva Entrada
          </Button>
        )}
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Fecha Inicio</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value, page: 1 })}
              />
            </Col>

            <Col md={4}>
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value, page: 1 })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Tipo</th>
                  <th>Proveedor</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {entradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No hay entradas registradas
                    </td>
                  </tr>
                ) : (
                  entradas.map((entrada) => (
                    <tr key={entrada._id}>
                      <td>{formatearFechaHora(entrada.fecha)}</td>
                      <td className="fw-semibold">
                        {entrada.producto?.nombre ||
                          `${entrada.producto?.productoBase || ""} - ${entrada.producto?.variante || ""}`}
                      </td>
                      <td>
                        <Badge bg="success">+{formatearNumero(entrada.cantidad)}</Badge>
                      </td>
                      <td>{entrada.tipoIngreso}</td>
                      <td>{entrada.proveedor?.nombre || "-"}</td>
                      <td>{entrada.usuario?.nombreCompleto || "-"}</td>
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

export default ListaEntradas;
