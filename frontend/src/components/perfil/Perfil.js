// frontend/src/components/perfil/Perfil.js
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

const Perfil = () => {
  const { usuario, cargando, actualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");

  // Cambiar contraseña REAL
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombreCompleto(usuario.nombreCompleto || "");
      setEmail(usuario.email || "");
    }
  }, [usuario]);

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <p>Cargando perfil...</p>
      </Container>
    );
  }

  if (!usuario) {
    return (
      <Container className="py-5">
        <Alert variant="danger">No se encontró el usuario en sesión.</Alert>
      </Container>
    );
  }

  const validarNuevaPassword = () => {
    if (!passwordNueva) return true;

    if (!passwordActual) {
      setError("Para cambiar la contraseña debes escribir tu contraseña actual.");
      return false;
    }

    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener mínimo 8 caracteres.");
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordNueva)) {
      setError("La nueva contraseña debe tener mayúsculas, minúsculas y números.");
      return false;
    }

    if (passwordNueva !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!validarNuevaPassword()) return;

    setGuardando(true);

    try {
      // 1) actualizar perfil (nombre/email) en backend
      const resPerfil = await authService.actualizarPerfil({
        nombreCompleto,
        email,
      });

      if (resPerfil?.usuario) {
        actualizarUsuario(resPerfil.usuario);
      }

      // 2) cambiar contraseña si escribió una nueva
      if (passwordNueva) {
        const resPass = await authService.cambiarPassword({
          passwordActual,
          passwordNueva,
        });

        // si backend devuelve token nuevo, lo guardamos
        if (resPass?.token) {
          authService.guardarToken(resPass.token);
        }

        // Limpiar inputs
        setPasswordActual("");
        setPasswordNueva("");
        setConfirmarPassword("");

        setOk("Perfil y contraseña actualizados ✅ (te toca volver a entrar si algo se pone raro 😅)");
      } else {
        setOk("Perfil actualizado correctamente ✅");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.mensaje || "Error al actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container fluid className="py-4">
      <h2 className="fw-bold mb-1">Mi Perfil</h2>
      <p className="text-muted mb-4">Actualiza tus datos de usuario</p>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      <Row className="g-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Datos del Usuario</h5>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    disabled={guardando}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={guardando}
                  />
                </Form.Group>

                <hr />

                <h6 className="fw-bold mb-3">
                  Cambiar contraseña <small className="text-muted">(opcional)</small>
                </h6>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña actual *</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordActual}
                    placeholder="Escribe tu contraseña actual"
                    onChange={(e) => setPasswordActual(e.target.value)}
                    disabled={guardando}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordNueva}
                    placeholder="Mínimo 8 caracteres"
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    disabled={guardando}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar nueva contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmarPassword}
                    placeholder="Repite la nueva contraseña"
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    disabled={guardando}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </Button>

                  <Button type="button" variant="outline-danger" onClick={handleCerrarSesion} disabled={guardando}>
                    Cerrar sesión
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Info de la sesión</h5>

              <p className="mb-1">
                <strong>Rol:</strong> {usuario.rol}
              </p>
              <p className="mb-1">
                <strong>Email:</strong> {usuario.email}
              </p>
              <p className="mb-3">
                <strong>ID:</strong> {usuario.id || "-"}
              </p>

              <Alert variant="info" className="mb-0">
                Si cambias contraseña: usa la nueva sí o sí 😌. Si te da 401, te manda a login.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Perfil;
