// frontend/src/components/muebles/NuevoMueble.js
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
  ListGroup
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSave, FiTrash2, FiRefreshCw } from "react-icons/fi";

import api from "../../services/api";
import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";

const SERVICIOS = [
  "Odontología",
  "Vacunación",
  "Laboratorio",
  "Farmacia",
  "Urgencias",
  "Sueroterapia"
];

const UNIDADES = ["Unidad", "Caja", "Frasco", "Bolsa", "Ampolla"];

const NuevoMueble = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productoBase: "",
    variante: "",
    nombre: "",
    categoria: "",
    tipoProducto: "mueble", // ✅ FIJO
    tipoServicio: "",
    unidadMedida: "",
    stockMinimo: "",
    stockActual: "",
    proveedor: ""
  });

  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState("");

  // Modal categorías
  const [showCategorias, setShowCategorias] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [accionCategoria, setAccionCategoria] = useState(false);

  const nombreFinal = useMemo(() => {
    const base = (formData.productoBase || "").trim();
    const varTxt = (formData.variante || "").trim();
    if (!base && !varTxt) return "";
    if (base && !varTxt) return base;
    if (!base && varTxt) return varTxt;
    return `${base} - ${varTxt}`;
  }, [formData.productoBase, formData.variante]);

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setCargandoInicial(true);
        setError("");

        const [respProv, cats] = await Promise.all([
          api.get("/proveedores"),
          categoriaService.obtenerCategorias()
        ]);

        const dataProv = respProv.data;
        const listaProv = Array.isArray(dataProv)
          ? dataProv
          : (dataProv?.proveedores || []);

        setProveedores(listaProv);
        setCategorias(cats || []);
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar proveedores o categorías.");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarTodo();
  }, []);

  const recargarCategorias = async () => {
    try {
      setCargandoCategorias(true);
      const cats = await categoriaService.obtenerCategorias();
      setCategorias(cats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoCategorias(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "categoria") {
      setFormData((prev) => ({ ...prev, categoria: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const crearCategoria = async () => {
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;

    try {
      setAccionCategoria(true);
      setError("");

      const creada = await categoriaService.crearCategoria(nombre, "");
      setNuevaCategoria("");
      await recargarCategorias();

      if (creada?._id) {
        setFormData((prev) => ({ ...prev, categoria: creada._id }));
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.mensaje || "No se pudo crear la categoría.");
    } finally {
      setAccionCategoria(false);
    }
  };

  const eliminarCategoria = async (cat) => {
    try {
      setAccionCategoria(true);
      setError("");

      await categoriaService.eliminarCategoria(cat._id);
      await recargarCategorias();

      setFormData((prev) => {
        if (prev.categoria === cat._id) return { ...prev, categoria: "" };
        return prev;
      });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.mensaje || "No se pudo eliminar la categoría.");
    } finally {
      setAccionCategoria(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const payload = {
        ...formData,
        nombre: nombreFinal,
        tipoProducto: "mueble", // ✅ blindado
        stockMinimo: Number(formData.stockMinimo),
        stockActual: Number(formData.stockActual)
      };

      await productoService.crearProducto(payload);
      navigate("/muebles");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.mensaje || "Error de validación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Nuevo Mueble</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/muebles")}>
          ← Volver
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {cargandoInicial ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              <span className="text-muted">Cargando...</span>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nombre del mueble *</Form.Label>
                    <Form.Control
                      name="productoBase"
                      value={formData.productoBase}
                      onChange={handleChange}
                      placeholder="Ej: Camilla"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Variante *</Form.Label>
                    <Form.Control
                      name="variante"
                      value={formData.variante}
                      onChange={handleChange}
                      placeholder='Ej: metálica / 2 puestos / con barandas'
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Nombre final</Form.Label>
                    <Form.Control value={nombreFinal} readOnly />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="mb-1">Categoría *</Form.Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setShowCategorias(true)}
                      >
                        <FiPlus className="me-1" />
                        Gestionar
                      </Button>
                    </div>

                    <Form.Select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                      disabled={!categorias.length}
                    >
                      <option value="">
                        {categorias.length ? "Selecciona una categoría..." : "No hay categorías (crea una)"}
                      </option>
                      {categorias.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Servicio *</Form.Label>
                    <Form.Select
                      name="tipoServicio"
                      value={formData.tipoServicio}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un servicio...</option>
                      {SERVICIOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Unidad de medida *</Form.Label>
                    <Form.Select
                      name="unidadMedida"
                      value={formData.unidadMedida}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Stock mínimo *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="stockMinimo"
                      value={formData.stockMinimo}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Stock actual *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="stockActual"
                      value={formData.stockActual}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Proveedor *</Form.Label>
                    <Form.Select
                      name="proveedor"
                      value={formData.proveedor}
                      onChange={handleChange}
                      required
                      disabled={!proveedores.length}
                    >
                      <option value="">
                        {proveedores.length ? "Selecciona un proveedor..." : "No hay proveedores"}
                      </option>
                      {proveedores.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/muebles")}
                    disabled={cargando}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={cargando || !proveedores.length || !categorias.length}
                  >
                    {cargando ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiSave className="me-2" />
                        Guardar Mueble
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* MODAL categorías */}
      <Modal show={showCategorias} onHide={() => setShowCategorias(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Gestionar categorías</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">Crea o elimina categorías</small>

            <Button
              type="button"
              size="sm"
              variant="outline-secondary"
              onClick={recargarCategorias}
              disabled={cargandoCategorias}
              title="Recargar"
            >
              <FiRefreshCw />
            </Button>
          </div>

          <InputGroup className="mb-3">
            <Form.Control
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nueva categoría (Ej: Mobiliario clínico)"
              disabled={accionCategoria}
            />
            <Button
              type="button"
              variant="primary"
              onClick={crearCategoria}
              disabled={accionCategoria || !nuevaCategoria.trim()}
            >
              <FiPlus className="me-1" />
              Agregar
            </Button>
          </InputGroup>

          {!categorias.length ? (
            <div className="text-muted">No hay categorías aún.</div>
          ) : (
            <ListGroup>
              {categorias.map((c) => (
                <ListGroup.Item
                  key={c._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>{c.nombre}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline-danger"
                    onClick={() => eliminarCategoria(c)}
                    disabled={accionCategoria}
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategorias(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default NuevoMueble;
