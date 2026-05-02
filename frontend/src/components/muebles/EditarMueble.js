import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiTrash2 } from "react-icons/fi";

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

const UNIDADES = ["Caja", "Unidad", "Frasco", "Bolsa", "Ampolla"];

const EditarMueble = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productoBase: "",
    variante: "",
    nombre: "",
    categoria: "",
    tipoProducto: "mueble", // ✅ forzado
    tipoServicio: "",
    unidadMedida: "",
    stockMinimo: "",
    stockActual: "",
    proveedor: ""
  });

  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

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

        const [respProv, cats, resProducto] = await Promise.all([
          api.get("/proveedores"),
          categoriaService.obtenerCategorias(),
          productoService.obtenerProducto(id)
        ]);

        const dataProv = respProv.data;
        const listaProv = Array.isArray(dataProv)
          ? dataProv
          : (dataProv?.proveedores || []);

        setProveedores(listaProv);
        setCategorias(cats || []);

        const p = resProducto?.producto;
        if (!p) {
          setError("No se pudo cargar el mueble.");
          return;
        }

        // ✅ Asegurar que sea mueble (opcional, por si alguien entra a editar un producto normal)
        const esMueble = String(p.tipoProducto || "").toLowerCase().includes("mueble");
        if (!esMueble) {
          setError("Este registro no es un mueble.");
          return;
        }

        setFormData({
          productoBase: p.productoBase || "",
          variante: p.variante || "",
          nombre: p.nombre || "",
          categoria: p.categoria?._id || p.categoria || "",
          tipoProducto: "mueble",
          tipoServicio: p.tipoServicio || "",
          unidadMedida: p.unidadMedida || "",
          stockMinimo: String(p.stockMinimo ?? ""),
          stockActual: String(p.stockActual ?? ""),
          proveedor: p.proveedor?._id || p.proveedor || ""
        });
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.mensaje || "Error cargando el mueble.");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarTodo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const payload = {
        ...formData,
        nombre: nombreFinal,
        tipoProducto: "mueble",
        stockMinimo: Number(formData.stockMinimo || 0),
        stockActual: Number(formData.stockActual || 0)
      };

      await productoService.actualizarProducto(id, payload);
      navigate("/muebles");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.mensaje || "No se pudo actualizar el mueble.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    const ok = window.confirm("¿Seguro que deseas eliminar este mueble? (Borrado lógico)");
    if (!ok) return;

    setEliminando(true);
    setError("");

    try {
      await productoService.eliminarProducto(id);
      navigate("/muebles");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.mensaje || "No se pudo eliminar el mueble.");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Editar Mueble</h2>
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
                    <Form.Label>Producto base *</Form.Label>
                    <Form.Control
                      name="productoBase"
                      value={formData.productoBase}
                      onChange={handleChange}
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
                    <Form.Label>Categoría *</Form.Label>
                    <Form.Select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                      disabled={!categorias.length}
                    >
                      <option value="">
                        {categorias.length ? "Selecciona una categoría..." : "No hay categorías"}
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
                    <Form.Label>Tipo de producto *</Form.Label>
                    <Form.Control
                      value="mueble"
                      readOnly
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Este módulo solo maneja muebles.
                    </Form.Text>
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

                <Col md={6}>
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

                <Col md={6}>
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

                <Col xs={12} className="d-flex justify-content-between mt-3">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleEliminar}
                    disabled={eliminando}
                  >
                    {eliminando ? "Eliminando..." : (
                      <>
                        <FiTrash2 className="me-2" />
                        Eliminar mueble
                      </>
                    )}
                  </Button>

                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate("/muebles")}
                      disabled={guardando}
                    >
                      Cancelar
                    </Button>

                    <Button type="submit" variant="primary" disabled={guardando}>
                      {guardando ? "Guardando..." : (
                        <>
                          <FiSave className="me-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditarMueble;
