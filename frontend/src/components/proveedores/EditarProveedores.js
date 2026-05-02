import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Button, Form, Alert } from "react-bootstrap";
import api from "../../services/api";

function EditarProveedor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    telefono: "",
    email: "",
    direccion: "",
    contacto: "",
    activo: true,
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const cargarProveedor = async () => {
    try {
      setCargando(true);
      setError("");

      const res = await api.get(`/proveedores/${id}`);
      const proveedor = res?.data?.proveedor || res?.data?.data;

      if (!proveedor) {
        setError("No se pudo cargar el proveedor");
        return;
      }

      setForm({
        nombre: proveedor.nombre || "",
        nit: proveedor.nit || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        direccion: proveedor.direccion || "",
        contacto: proveedor.contacto || "",
        activo: proveedor.activo !== false,
      });
    } catch (e) {
      setError(e?.response?.data?.mensaje || "Error cargando proveedor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim() || !form.nit.trim()) {
      setError("Nombre y NIT son obligatorios");
      return;
    }

    setGuardando(true);
    try {
      await api.put(`/proveedores/${id}`, {
        ...form,
        nombre: form.nombre.trim(),
        nit: form.nit.trim(),
        telefono: (form.telefono || "").trim(),
        email: (form.email || "").trim(),
        direccion: (form.direccion || "").trim(),
        contacto: (form.contacto || "").trim(),
        activo: !!form.activo,
      });

      navigate("/proveedores");
    } catch (e) {
      setError(e?.response?.data?.mensaje || "No se pudo actualizar el proveedor");
    } finally {
      setGuardando(false);
    }
  };

  const onEliminar = async () => {
    setError("");
    const ok = window.confirm("¿Seguro que deseas eliminar este proveedor? (Se desactiva)");
    if (!ok) return;

    setEliminando(true);
    try {
      await api.delete(`/proveedores/${id}`);
      navigate("/proveedores");
    } catch (e) {
      setError(e?.response?.data?.mensaje || "No se pudo eliminar el proveedor");
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="fw-bold mb-0">Editar Proveedor</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/proveedores")}>
          Volver
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control name="nombre" value={form.nombre} onChange={onChange} required />
              </div>

              <div className="col-md-6">
                <Form.Label>NIT *</Form.Label>
                <Form.Control name="nit" value={form.nit} onChange={onChange} required />
              </div>

              <div className="col-md-4">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control name="telefono" value={form.telefono} onChange={onChange} />
              </div>

              <div className="col-md-4">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" type="email" value={form.email} onChange={onChange} />
              </div>

              <div className="col-md-4">
                <Form.Label>Contacto</Form.Label>
                <Form.Control name="contacto" value={form.contacto} onChange={onChange} />
              </div>

              <div className="col-md-12">
                <Form.Label>Dirección</Form.Label>
                <Form.Control name="direccion" value={form.direccion} onChange={onChange} />
              </div>

              <div className="col-md-4">
                <Form.Check
                  className="mt-4"
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={onChange}
                  label="Proveedor activo"
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </Button>

              <Button type="button" variant="light" onClick={() => navigate("/proveedores")}>
                Cancelar
              </Button>

              <div className="ms-auto">
                <Button
                  type="button"
                  variant="danger"
                  onClick={onEliminar}
                  disabled={eliminando}
                >
                  {eliminando ? "Eliminando..." : "Eliminar proveedor"}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditarProveedor;
