// frontend/src/components/salidas/NuevaSalida.js
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiSave } from "react-icons/fi";

import { salidaService } from "../../services/salidaService";
import { productoService } from "../../services/productoService";

const NuevaSalida = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    tipo: "SALIDA", // SALIDA | PRESTAMO
    fechaDevolucion: "",
    responsable: "",
  });

  // ✅ CARGAR PRODUCTOS (FIX: soporta cualquier formato de respuesta)
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await productoService.obtenerProductos({ search: "" });

        // ✅ Blindado: si viene { productos } o { data } o cualquier cosa rara
        const lista =
          data?.productos ||
          data?.data ||
          data?.items ||
          data?.resultado ||
          [];

        setProductos(Array.isArray(lista) ? lista : []);
      } catch (e) {
        console.error("Error cargando productos:", e);
        setProductos([]);
        setError(e?.response?.data?.mensaje || "No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const productoSeleccionado = useMemo(() => {
    return productos.find((p) => p._id === form.producto);
  }, [productos, form.producto]);

  const stockDisponible = Number(productoSeleccionado?.stockActual ?? 0);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "tipo") {
      setForm((prev) => ({
        ...prev,
        tipo: value,
        fechaDevolucion: value === "PRESTAMO" ? prev.fechaDevolucion : "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.producto) return setError("Selecciona un producto.");
    if (!form.cantidad || Number(form.cantidad) <= 0) return setError("Cantidad inválida.");

    if (Number(form.cantidad) > stockDisponible) {
      return setError(`Stock insuficiente. Disponible: ${stockDisponible}`);
    }

    if (form.tipo === "PRESTAMO" && !form.fechaDevolucion) {
      return setError("Si es préstamo, debes elegir fecha de devolución.");
    }

    setGuardando(true);
    try {
      await salidaService.crearSalida({
        producto: form.producto,
        cantidad: Number(form.cantidad),
        tipo: form.tipo,
        fechaDevolucion: form.tipo === "PRESTAMO" ? form.fechaDevolucion : null,
        responsable: form.responsable,
      });

      navigate("/salidas");
    } catch (err) {
      console.error("Error creando salida:", err);
      setError(err?.response?.data?.mensaje || "No se pudo registrar la salida.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Nueva Salida</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/salidas")}>
          ← Volver
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {cargando ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : (
            <Form onSubmit={onSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Producto *</Form.Label>
                    <Form.Select name="producto" value={form.producto} onChange={onChange} required>
                      <option value="">Selecciona un producto...</option>
                      {productos.map((p) => (
                        <option key={p._id} value={p._id}>
                          {(p.nombre || `${p.productoBase} - ${p.variante}`)} (Stock: {p.stockActual ?? 0})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo *</Form.Label>
                    <Form.Select name="tipo" value={form.tipo} onChange={onChange} required>
                      <option value="SALIDA">Salida</option>
                      <option value="PRESTAMO">Préstamo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Cantidad *</Form.Label>
                    <Form.Control
                      type="number"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={onChange}
                      min="1"
                      required
                    />
                    {form.producto && (
                      <small className="text-muted">Disponible: {stockDisponible}</small>
                    )}
                  </Form.Group>
                </Col>

                {form.tipo === "PRESTAMO" && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Fecha de devolución *</Form.Label>
                      <Form.Control
                        type="date"
                        name="fechaDevolucion"
                        value={form.fechaDevolucion}
                        onChange={onChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}

                <Col md={form.tipo === "PRESTAMO" ? 6 : 12}>
                  <Form.Group>
                    <Form.Label>Responsable</Form.Label>
                    <Form.Control
                      name="responsable"
                      value={form.responsable}
                      onChange={onChange}
                      placeholder="Ej: Enfermería / Juan Pérez"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/salidas")}
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>

                  <Button type="submit" variant="primary" disabled={guardando}>
                    {guardando ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiSave className="me-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NuevaSalida;