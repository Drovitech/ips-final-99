import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Form, Alert } from "react-bootstrap";
import api from "../../services/api";

function ProveedorNuevo() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    setLoading(true);
    try {
      await api.post("/proveedores", {
        ...form,
        nombre: form.nombre.trim(),
        nit: form.nit.trim(),
        email: (form.email || "").trim(),
        telefono: (form.telefono || "").trim(),
        direccion: (form.direccion || "").trim(),
        contacto: (form.contacto || "").trim(),
      });

      // ✅ vuelve a la tabla
      navigate("/proveedores");
    } catch (err) {
      const msg =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        "No se pudo crear el proveedor";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="fw-bold mb-0">Nuevo Proveedor</h2>
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
                <Form.Control
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Ej: Droguería ABC SAS"
                  required
                />
              </div>

              <div className="col-md-6">
                <Form.Label>NIT *</Form.Label>
                <Form.Control
                  name="nit"
                  value={form.nit}
                  onChange={onChange}
                  placeholder="Ej: 900123456-7"
                  required
                />
              </div>

              <div className="col-md-4">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={form.telefono}
                  onChange={onChange}
                  placeholder="Ej: 3001234567"
                />
              </div>

              <div className="col-md-4">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="contacto@proveedor.com"
                />
              </div>

              <div className="col-md-4">
                <Form.Label>Contacto</Form.Label>
                <Form.Control
                  name="contacto"
                  value={form.contacto}
                  onChange={onChange}
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="col-md-12">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  name="direccion"
                  value={form.direccion}
                  onChange={onChange}
                  placeholder="Dirección del proveedor"
                />
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
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Proveedor"}
              </Button>
              <Button
                type="button"
                variant="light"
                onClick={() => navigate("/proveedores")}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProveedorNuevo;