// frontend/src/components/configuracion/Configuracion.js
import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Alert, ListGroup, Badge } from "react-bootstrap";
import { FiSave, FiRefreshCw } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { systemService } from "../../services/systemService";

const Configuracion = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  // ============================
  // 1) INFORMACIÓN OPERATIVA (solo lectura)
  // ============================
  const infoOperativa = {
    nombre_ips: "IPS Salud+",
    sede_principal: "Sede Central – Bogotá",
    horario_operativo: "Lunes a Viernes 7:00 am – 6:00 pm",
    servicios_clinicos: ["Vacunación", "Consulta externa", "Urgencias"],
    correo_institucional: "farmacia@ipssalud.co",
    telefono_farmacia: "Ext. 120 - 121",
  };

  // ============================
  // 2) ESTADO DEL SISTEMA (desde backend)
  // ============================
  const [estadoSistema, setEstadoSistema] = useState(null);
  const [cargandoEstado, setCargandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState("");

  const cargarEstadoSistema = async () => {
    try {
      setCargandoEstado(true);
      setErrorEstado("");
      const data = await systemService.obtenerEstado();
      setEstadoSistema(data?.status || null);
    } catch (e) {
      // Si tu interceptor te manda al login por 401, esto no molestará
      setErrorEstado("No se pudo cargar el estado del sistema.");
      setEstadoSistema(null);
    } finally {
      setCargandoEstado(false);
    }
  };

  useEffect(() => {
    cargarEstadoSistema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================
  // 3) BUENAS PRÁCTICAS (solo lectura)
  // ============================
  const lineamientos = [
    "Todas las entradas deben registrarse con lote y fecha de vencimiento.",
    "Las salidas no deben realizarse sin stock confirmado.",
    "Los productos vencidos no deben ser dispensados.",
    "El stock mínimo debe mantenerse actualizado por cada producto.",
    "Cualquier inconsistencia debe reportarse al administrador para auditoría.",
  ];

  return (
    <Container fluid className="py-4">
      <h2 className="fw-bold mb-4">Configuración</h2>

      <Row className="g-4">
        {/* 1) INFO OPERATIVA */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">📍 Información Operativa</h5>
            </Card.Header>

            <Card.Body>
              <div className="mb-2"><strong>IPS:</strong> {infoOperativa.nombre_ips}</div>
              <div className="mb-2"><strong>Sede Principal:</strong> {infoOperativa.sede_principal}</div>
              <div className="mb-2"><strong>Horario:</strong> {infoOperativa.horario_operativo}</div>
              <div className="mb-2">
                <strong>Servicios:</strong> {infoOperativa.servicios_clinicos.join(", ")}
              </div>
              <div className="mb-2"><strong>Correo institucional:</strong> {infoOperativa.correo_institucional}</div>
              <div className="mb-2"><strong>Teléfono interno farmacia:</strong> {infoOperativa.telefono_farmacia}</div>

              <small className="text-muted">
                Esta información es de consulta y ayuda a personal nuevo y auditorías.
              </small>
            </Card.Body>
          </Card>
        </Col>

        {/* 2) ESTADO DEL SISTEMA */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0">🖥 Estado del Sistema</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={cargarEstadoSistema}
                disabled={cargandoEstado}
              >
                <FiRefreshCw className="me-2" />
                {cargandoEstado ? "Actualizando..." : "Actualizar"}
              </Button>
            </Card.Header>

            <Card.Body>
              {errorEstado && <Alert variant="danger">{errorEstado}</Alert>}

              {!estadoSistema ? (
                <div className="text-muted">Sin información disponible.</div>
              ) : (
                <>
                  <div className="mb-2">
                    <strong>Base de datos:</strong>{" "}
                    <Badge bg={estadoSistema.database === "Conectada" ? "success" : "danger"}>
                      {estadoSistema.database}
                    </Badge>
                  </div>
                  <div className="mb-2"><strong>Hora servidor:</strong> {new Date(estadoSistema.serverTime).toLocaleString()}</div>
                  <div className="mb-2"><strong>Versión:</strong> {estadoSistema.version}</div>
                  <div className="mb-2"><strong>Ambiente:</strong> {estadoSistema.environment}</div>
                  <div className="mb-2"><strong>Uptime:</strong> {estadoSistema.uptimeSeconds}s</div>

                  <small className="text-muted">
                    Ideal para soporte y auditoría. No afecta inventario.
                  </small>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* 3) BUENAS PRÁCTICAS */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">📘 Lineamientos Operativos</h5>
            </Card.Header>

            <Card.Body>
              <Alert variant="info" className="mb-3">
                Sección informativa institucional. Refuerza buenas prácticas y facilita auditorías.
              </Alert>

              <ListGroup variant="flush">
                {lineamientos.map((txt, idx) => (
                  <ListGroup.Item key={idx}>{txt}</ListGroup.Item>
                ))}
              </ListGroup>

              <div className="mt-3">
                <small className="text-muted">
                  * No modifica procesos automáticamente. Es guía oficial de operación.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ALERTAS (tu bloque actual) */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Alertas y Notificaciones</h5>
            </Card.Header>

            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Días de anticipación para vencimientos</Form.Label>
                  <Form.Control type="number" defaultValue="30" />
                  <Form.Text className="text-muted">
                    Número de días antes del vencimiento para generar alertas
                  </Form.Text>
                </Form.Group>

                <Form.Check type="switch" label="Notificar por email stock bajo" className="mb-3" />
                <Form.Check type="switch" label="Notificar productos próximos a vencer" className="mb-3" />

                <Button variant="primary">
                  <FiSave className="me-2" />
                  Guardar Cambios
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* MODO OSCURO */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0">Apariencia</h5>
            </Card.Header>

            <Card.Body>
              <Form.Check
                type="switch"
                id="dark-mode-switch"
                label="Activar modo oscuro"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <Form.Text className="text-muted">
                Cambia la apariencia visual del sistema. No afecta datos ni procesos.
              </Form.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Configuracion;