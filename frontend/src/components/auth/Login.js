// frontend/src/components/auth/Login.js
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Detectar sesión expirada
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("expired") === "1") {
      setInfo("Tu sesión expiró. Por favor inicia sesión nuevamente.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setCargando(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container
      fluid
      className="vh-100"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Row className="justify-content-center align-items-center h-100">
        <Col md={5} lg={4}>
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">IPS Salud+</h2>
                <p className="text-muted">Sistema de Gestión de Inventario</p>
              </div>

              {/* ✅ Mensaje por sesión expirada */}
              {info && <Alert variant="warning">{info}</Alert>}

              {/* ❌ Error normal de login */}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="usuario@ipssalud.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={cargando}
                >
                  {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  © 2024 IPS Salud+ - Todos los derechos reservados
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
