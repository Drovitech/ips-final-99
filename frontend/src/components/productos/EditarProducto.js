import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Button, Form, Alert, Row, Col } from "react-bootstrap";

import { productoService } from "../../services/productoService";
import { categoriaService } from "../../services/categoriaService";
import { proveedorService } from "../../services/proveedorService";

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productoBase: "",
    variante: "",
    categoria: "",
    tipoProducto: "",
    tipoServicio: "",
    unidadMedida: "",
    stockMinimo: "",
    stockActual: "",
    proveedor: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [prodRes, cats, provs] = await Promise.all([
        productoService.obtenerProducto(id),
        categoriaService.obtenerCategorias(),
        proveedorService.obtenerProveedoresActivos(),
      ]);

      const producto = prodRes?.producto || prodRes?.data;

      if (!producto) {
        setError("No se pudo cargar el producto");
        return;
      }

      setCategorias(cats || []);
      setProveedores(provs || []);

      setForm({
        productoBase: producto.productoBase || "",
        variante: producto.variante || "",
        categoria: producto.categoria?._id || "",
        tipoProducto: producto.tipoProducto || "",
        tipoServicio: producto.tipoServicio || "",
        unidadMedida: producto.unidadMedida || "",
        stockMinimo: producto.stockMinimo || "",
        stockActual: producto.stockActual || "",
        proveedor: producto.proveedor?._id || "",
      });
    } catch (e) {
      setError("Error cargando información");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      await productoService.actualizarProducto(id, {
        ...form,
        stockMinimo: Number(form.stockMinimo),
        stockActual: Number(form.stockActual),
      });

      navigate("/productos");
    } catch (e) {
      setError(e?.response?.data?.mensaje || "No se pudo actualizar");
    } finally {
      setGuardando(false);
    }
  };

  const onEliminar = async () => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    setEliminando(true);
    try {
      await productoService.eliminarProducto(id);
      navigate("/productos");
    } catch (e) {
      setError("No se pudo eliminar");
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Editar Producto</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/productos")}>
          Volver
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Producto base *</Form.Label>
                <Form.Control name="productoBase" value={form.productoBase} onChange={onChange} />
              </Col>

              <Col md={6}>
                <Form.Label>Variante *</Form.Label>
                <Form.Control name="variante" value={form.variante} onChange={onChange} />
              </Col>

              <Col md={6}>
                <Form.Label>Categoría *</Form.Label>
                <Form.Select name="categoria" value={form.categoria} onChange={onChange}>
                  <option value="">Selecciona...</option>
                  {categorias.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Tipo de producto *</Form.Label>
                <Form.Control name="tipoProducto" value={form.tipoProducto} onChange={onChange} />
              </Col>

              <Col md={6}>
                <Form.Label>Servicio *</Form.Label>
                <Form.Select name="tipoServicio" value={form.tipoServicio} onChange={onChange}>
                  <option value="">Selecciona...</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Vacunación">Vacunación</option>
                  <option value="Laboratorio">Laboratorio</option>
                  <option value="Urgencias">Urgencias</option>
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Unidad de medida *</Form.Label>
                <Form.Select name="unidadMedida" value={form.unidadMedida} onChange={onChange}>
                  <option value="">Selecciona...</option>
                  <option value="Caja">Caja</option>
                  <option value="Unidad">Unidad</option>
                  <option value="Frasco">Frasco</option>
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Stock mínimo *</Form.Label>
                <Form.Control type="number" name="stockMinimo" value={form.stockMinimo} onChange={onChange} />
              </Col>

              <Col md={6}>
                <Form.Label>Stock actual *</Form.Label>
                <Form.Control type="number" name="stockActual" value={form.stockActual} onChange={onChange} />
              </Col>

              <Col md={12}>
                <Form.Label>Proveedor *</Form.Label>
                <Form.Select name="proveedor" value={form.proveedor} onChange={onChange}>
                  <option value="">Selecciona proveedor...</option>
                  {proveedores.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="mt-4 d-flex gap-2">
              <Button type="submit" disabled={guardando}>
                Guardar Cambios
              </Button>
              <Button variant="light" onClick={() => navigate("/productos")}>
                Cancelar
              </Button>
              <Button
                className="ms-auto"
                variant="danger"
                onClick={onEliminar}
                disabled={eliminando}
              >
                Eliminar producto
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditarProducto;
