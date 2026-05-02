// frontend/src/components/entradas/NuevaEntrada.js
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiSave, FiPlus } from "react-icons/fi";

import api from "../../services/api";
import { productoService } from "../../services/productoService";
import { loteService } from "../../services/loteService";
import { entradaService } from "../../services/entradaService";

const TIPOS_INGRESO = ["Compra", "Donación", "Ajuste", "Devolución", "Traslado"];

const NuevaEntrada = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [lotes, setLotes] = useState([]);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoLotes, setCargandoLotes] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    producto: "",
    lote: "",
    cantidad: "",
    tipoIngreso: "Compra",
    proveedor: "",
    numeroFactura: "",
    valorUnitario: "",
    observaciones: "",
    fecha: "",
  });

  // =========================
  // MODAL NUEVO LOTE
  // =========================
  const [showLote, setShowLote] = useState(false);
  const [creandoLote, setCreandoLote] = useState(false);
  const [errorLote, setErrorLote] = useState("");

  const [nuevoLote, setNuevoLote] = useState({
    numeroLote: "",
    fechaVencimiento: "",
    numeroSerie: "",
    cantidadInicial: 0, // lo dejamos 0 por defecto (entrada suma después)
  });

  // ✅ Cargar productos + proveedores (una vez)
  useEffect(() => {
    const cargar = async () => {
      try {
        setCargandoInicial(true);
        setError("");

        const [respProductos, respProv] = await Promise.all([
          productoService.obtenerProductos({ search: "" }),
          api.get("/proveedores"),
        ]);

        setProductos(respProductos?.productos || []);

        const dataProv = respProv.data;
        const listaProv = Array.isArray(dataProv) ? dataProv : dataProv?.proveedores || [];
        setProveedores(listaProv);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar productos o proveedores.");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargar();
  }, []);

  // ✅ Cargar lotes del producto seleccionado
  useEffect(() => {
    const cargarLotesProducto = async () => {
      try {
        setError("");
        setErrorLote("");

        if (!form.producto) {
          setLotes([]);
          setForm((prev) => ({ ...prev, lote: "" }));
          return;
        }

        setCargandoLotes(true);

        // soporte por si tu servicio ya existe:
        // loteService.obtenerLotes({ producto })
        const resp = await loteService.obtenerLotes({ producto: form.producto });

        const lista = resp?.lotes || resp?.data?.lotes || [];
        setLotes(lista);

        // si el lote seleccionado ya no existe, lo limpiamos
        setForm((prev) => {
          const existe = lista.some((l) => l._id === prev.lote);
          return existe ? prev : { ...prev, lote: "" };
        });
      } catch (e) {
        console.error(e);
        setLotes([]);
      } finally {
        setCargandoLotes(false);
      }
    };

    cargarLotesProducto();
  }, [form.producto]);

  const productoSeleccionado = useMemo(() => {
    return productos.find((p) => p._id === form.producto);
  }, [productos, form.producto]);

  const stockActual = Number(productoSeleccionado?.stockActual ?? 0);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // =========================
  // CREAR LOTE DESDE MODAL
  // =========================
  const abrirModalLote = () => {
    if (!form.producto) {
      setError("Selecciona un producto primero para crear su lote.");
      return;
    }
    setError("");
    setErrorLote("");
    setNuevoLote({
      numeroLote: "",
      fechaVencimiento: "",
      numeroSerie: "",
      cantidadInicial: 0,
    });
    setShowLote(true);
  };

  const crearLote = async () => {
    setErrorLote("");

    if (!form.producto) return setErrorLote("Selecciona un producto.");
    if (!nuevoLote.numeroLote.trim()) return setErrorLote("Número de lote es obligatorio.");
    if (!nuevoLote.fechaVencimiento) return setErrorLote("Fecha de vencimiento es obligatoria.");

    setCreandoLote(true);
    try {
      // OJO: aquí creamos lote con cantidad 0 por defecto
      // (la entrada es la que suma el stock)
      const payload = {
        producto: form.producto,
        numeroLote: nuevoLote.numeroLote.trim(),
        fechaVencimiento: nuevoLote.fechaVencimiento,
        numeroSerie: nuevoLote.numeroSerie?.trim() || "",
        cantidad: Number(nuevoLote.cantidadInicial || 0),
      };

      const resp = await loteService.crearLote(payload);

      const loteCreado = resp?.lote || resp?.data?.lote;
      if (!loteCreado?._id) {
        throw new Error("No se pudo crear el lote.");
      }

      // recargar lotes del producto
      const recarga = await loteService.obtenerLotes({ producto: form.producto });
      const lista = recarga?.lotes || recarga?.data?.lotes || [];
      setLotes(lista);

      // seleccionarlo automáticamente
      setForm((prev) => ({ ...prev, lote: loteCreado._id }));

      setShowLote(false);
    } catch (e) {
      console.error(e);
      setErrorLote(e?.response?.data?.mensaje || e?.message || "No se pudo crear el lote.");
    } finally {
      setCreandoLote(false);
    }
  };

  // =========================
  // GUARDAR ENTRADA
  // =========================
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.producto) return setError("Selecciona un producto.");
    if (!form.lote) return setError("Selecciona un lote (o créalo).");
    if (!form.cantidad || Number(form.cantidad) <= 0) return setError("Cantidad inválida.");
    if (!form.tipoIngreso) return setError("Selecciona tipo de ingreso.");

    setGuardando(true);
    try {
      await entradaService.crearEntrada({
        producto: form.producto,
        lote: form.lote,
        cantidad: Number(form.cantidad),
        tipoIngreso: form.tipoIngreso,
        proveedor: form.proveedor || null,
        numeroFactura: form.numeroFactura || "",
        valorUnitario: Number(form.valorUnitario || 0),
        observaciones: form.observaciones || "",
        fecha: form.fecha ? form.fecha : null,
      });

      navigate("/entradas");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.mensaje || err?.response?.data?.message || "No se pudo registrar la entrada.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Nueva Entrada</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/entradas")}>
          ← Volver
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {cargandoInicial ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : !productos.length ? (
            <Alert variant="warning" className="mb-0">
              No hay productos creados aún.
            </Alert>
          ) : (
            <Form onSubmit={onSubmit}>
              <Row className="g-3">
                {/* PRODUCTO */}
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
                    {form.producto && <small className="text-muted">Stock actual: {stockActual}</small>}
                  </Form.Group>
                </Col>

                {/* LOTE + BOTÓN CREAR */}
                <Col md={6}>
                  <Form.Group>
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="mb-1">Lote *</Form.Label>
                      <Button type="button" size="sm" variant="outline-primary" onClick={abrirModalLote}>
                        <FiPlus className="me-1" />
                        Crear lote
                      </Button>
                    </div>

                    <Form.Select
                      name="lote"
                      value={form.lote}
                      onChange={onChange}
                      required
                      disabled={!form.producto || cargandoLotes}
                    >
                      <option value="">
                        {!form.producto
                          ? "Selecciona un producto primero..."
                          : cargandoLotes
                          ? "Cargando lotes..."
                          : "Selecciona un lote..."}
                      </option>
                      {lotes.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.numeroLote} {l.fechaVencimiento ? ` (Vence: ${new Date(l.fechaVencimiento).toLocaleDateString()})` : ""}
                        </option>
                      ))}
                    </Form.Select>

                    {form.producto && !cargandoLotes && lotes.length === 0 && (
                      <small className="text-danger">
                        No hay lotes para este producto. Crea un lote primero.
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
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
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tipo de ingreso *</Form.Label>
                    <Form.Select name="tipoIngreso" value={form.tipoIngreso} onChange={onChange} required>
                      {TIPOS_INGRESO.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Fecha (opcional)</Form.Label>
                    <Form.Control type="date" name="fecha" value={form.fecha} onChange={onChange} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Proveedor (opcional)</Form.Label>
                    <Form.Select name="proveedor" value={form.proveedor} onChange={onChange}>
                      <option value="">Selecciona...</option>
                      {proveedores.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Número de factura (opcional)</Form.Label>
                    <Form.Control name="numeroFactura" value={form.numeroFactura} onChange={onChange} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Valor unitario (opcional)</Form.Label>
                    <Form.Control
                      type="number"
                      name="valorUnitario"
                      value={form.valorUnitario}
                      onChange={onChange}
                      min="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="observaciones"
                      value={form.observaciones}
                      onChange={onChange}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} className="d-flex justify-content-end gap-2 mt-3">
                  <Button type="button" variant="outline-secondary" onClick={() => navigate("/entradas")} disabled={guardando}>
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={guardando || !form.producto || !form.lote || lotes.length === 0}
                  >
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

      {/* MODAL CREAR LOTE */}
      <Modal show={showLote} onHide={() => setShowLote(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear lote</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorLote && <Alert variant="danger">{errorLote}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Número de lote *</Form.Label>
            <Form.Control
              value={nuevoLote.numeroLote}
              onChange={(e) => setNuevoLote((p) => ({ ...p, numeroLote: e.target.value }))}
              placeholder="Ej: L-001"
              disabled={creandoLote}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de vencimiento *</Form.Label>
            <Form.Control
              type="date"
              value={nuevoLote.fechaVencimiento}
              onChange={(e) => setNuevoLote((p) => ({ ...p, fechaVencimiento: e.target.value }))}
              disabled={creandoLote}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Número de serie (opcional)</Form.Label>
            <Form.Control
              value={nuevoLote.numeroSerie}
              onChange={(e) => setNuevoLote((p) => ({ ...p, numeroSerie: e.target.value }))}
              disabled={creandoLote}
            />
          </Form.Group>

          <InputGroup className="mb-2">
            <InputGroup.Text>Cantidad inicial</InputGroup.Text>
            <Form.Control
              type="number"
              min="0"
              value={nuevoLote.cantidadInicial}
              onChange={(e) => setNuevoLote((p) => ({ ...p, cantidadInicial: e.target.value }))}
              disabled={creandoLote}
            />
          </InputGroup>
          <small className="text-muted">
            Tip: puedes dejarla en 0 y que la <b>Entrada</b> sea la que sume el stock (flujo recomendado).
          </small>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowLote(false)} disabled={creandoLote}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={crearLote} disabled={creandoLote}>
            {creandoLote ? (
              <>
                <Spinner size="sm" className="me-2" />
                Creando...
              </>
            ) : (
              <>
                <FiPlus className="me-2" />
                Crear lote
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NuevaEntrada;
