// frontend/src/components/dashboard/Dashboard.js
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Badge, ListGroup } from "react-bootstrap";
import { FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiBox } from "react-icons/fi";
import { dashboardService } from "../../services/dashboardService";
import { formatearFechaHora, formatearNumero } from "../../utils/formatters";

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [ultimasEntradas, setUltimasEntradas] = useState([]);
  const [ultimasSalidas, setUltimasSalidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await dashboardService.obtenerEstadisticas();

      setEstadisticas(data.estadisticas);
      setUltimasEntradas(data.ultimasEntradas || []);
      setUltimasSalidas(data.ultimasSalidas || []);
    } catch (err) {
      const status = err?.response?.status;

      // ✅ Si es 401/403: el interceptor ya redirige al login, no muestres el error rojo
      if (status === 401 || status === 403) return;

      setError("Error al cargar el dashboard");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4 fw-bold">Dashboard de Inventario</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tarjetas de estadísticas */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Productos por Vencer</p>
                  <h3 className="mb-0 fw-bold">{estadisticas?.proximosVencer || 0}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiAlertTriangle className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Stock Crítico</p>
                  <h3 className="mb-0 fw-bold">{estadisticas?.stockCritico || 0}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <FiBox className="text-danger" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Entradas del Día</p>
                  <h3 className="mb-0 fw-bold">{estadisticas?.entradasHoy || 0}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiTrendingUp className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Salidas del Día</p>
                  <h3 className="mb-0 fw-bold">{estadisticas?.salidasHoy || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiTrendingDown className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Movimientos recientes */}
      <Row className="g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">Entradas del Día</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {ultimasEntradas.length === 0 ? (
                <div className="text-center py-4 text-muted">No hay entradas registradas hoy</div>
              ) : (
                <ListGroup variant="flush">
                  {ultimasEntradas.map((entrada) => (
                    <ListGroup.Item key={entrada._id} className="border-start-0 border-end-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{entrada.producto?.nombre}</h6>
                          <small className="text-muted">
                            Proveedor: {entrada.proveedor?.nombre || "-"}
                          </small>
                        </div>
                        <Badge bg="success" className="ms-2">
                          +{formatearNumero(entrada.cantidad)}
                        </Badge>
                      </div>
                      <small className="text-muted d-block mt-1">{formatearFechaHora(entrada.fecha)}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">Salidas del Día</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {ultimasSalidas.length === 0 ? (
                <div className="text-center py-4 text-muted">No hay salidas registradas hoy</div>
              ) : (
                <ListGroup variant="flush">
                  {ultimasSalidas.map((salida) => (
                    <ListGroup.Item key={salida._id} className="border-start-0 border-end-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{salida.producto?.nombre}</h6>
                          <small className="text-muted">
                            {salida.motivo} - {salida.responsable}
                          </small>
                        </div>
                        <Badge bg="danger" className="ms-2">
                          -{formatearNumero(salida.cantidad)}
                        </Badge>
                      </div>
                      <small className="text-muted d-block mt-1">{formatearFechaHora(salida.fecha)}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
