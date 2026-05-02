// frontend/src/components/salidas/ListaSalidas.js
import { useEffect, useState, useCallback } from "react";
import { Container, Card, Table, Button, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { salidaService } from "../../services/salidaService";

const ListaSalidas = () => {
  const [salidas, setSalidas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const data = await salidaService.obtenerSalidas({ desde, hasta, tipo });
      setSalidas(data?.salidas || []);
    } catch (e) {
      console.error("Error cargando salidas:", e);
      setSalidas([]);
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, tipo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const formatoFecha = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const nombreProducto = (s) => {
    const p = s?.producto;
    if (!p) return "-";
    return p.nombre || `${p.productoBase || ""} - ${p.variante || ""}`.trim();
  };

  const badgeTipo = (s) => {
    if (s.tipo === "PRESTAMO") return <Badge bg="warning">Préstamo</Badge>;
    return <Badge bg="primary">Salida</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Salidas de Inventario</h2>

        <Button as={Link} to="/salidas/nueva" variant="primary">
          + Nueva Salida
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex gap-3 flex-wrap">
            <div style={{ minWidth: 240 }}>
              <Form.Label>Fecha Inicio</Form.Label>
              <Form.Control
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>

            <div style={{ minWidth: 240 }}>
              <Form.Label>Fecha Fin</Form.Label>
              <Form.Control
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>

            <div style={{ minWidth: 240 }}>
              <Form.Label>Tipo</Form.Label>
              <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="SALIDA">Salida</option>
                <option value="PRESTAMO">Préstamo</option>
              </Form.Select>
            </div>

            <div className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={cargar}>
                Filtrar
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Tipo</th>
                  <th>Fecha devolución</th>
                  <th>Responsable</th>
                  <th>Usuario</th>
                </tr>
              </thead>

              <tbody>
                {salidas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No hay salidas registradas
                    </td>
                  </tr>
                ) : (
                  salidas.map((s) => (
                    <tr key={s._id}>
                      <td>{formatoFecha(s.fecha)}</td>
                      <td className="fw-semibold">{nombreProducto(s)}</td>
                      <td>{s.cantidad}</td>
                      <td>{badgeTipo(s)}</td>
                      <td>
                        {s.tipo === "PRESTAMO" ? formatoFecha(s.fechaDevolucion) : "-"}
                      </td>
                      <td>{s.responsable || "-"}</td>
                      <td>{s.usuario?.nombreCompleto || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListaSalidas;
