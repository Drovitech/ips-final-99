import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  InputGroup,
  Form,
  Button
} from "react-bootstrap";
import { FiSearch, FiPlus, FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";
import { productoService } from "../../services/productoService";

const StockMuebles = () => {
  const [muebles, setMuebles] = useState([]);
  const [search, setSearch] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);

      // ✅ Trae productos y filtramos en frontend por tipoProducto = "mueble"
      const data = await productoService.obtenerProductos({ search });
      const lista = data?.productos || [];

      const soloMuebles = lista.filter((p) =>
        String(p.tipoProducto || "").toLowerCase().includes("mueble")
      );

      setMuebles(soloMuebles);
    } catch (e) {
      setMuebles([]);
    } finally {
      setCargando(false);
    }
  }, [search]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const estadoStock = (p) => {
    const a = Number(p.stockActual || 0);
    const m = Number(p.stockMinimo || 0);
    if (a === 0) return { txt: "Agotado", color: "danger" };
    if (a <= m) return { txt: "Stock bajo", color: "warning" };
    return { txt: "Normal", color: "success" };
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">Stock de Muebles</h2>

        <div className="d-flex gap-2 align-items-center">
          <Button as={Link} to="/muebles/nuevo" variant="primary">
            <FiPlus className="me-2" />
            Agregar mueble
          </Button>

          <InputGroup style={{ maxWidth: 360 }}>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar mueble..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

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
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {muebles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No hay muebles registrados (usa tipoProducto = "mueble")
                    </td>
                  </tr>
                ) : (
                  muebles.map((p) => {
                    const est = estadoStock(p);

                    return (
                      <tr key={p._id}>
                        <td className="fw-semibold">
                          {p.nombre || `${p.productoBase} - ${p.variante}`}
                        </td>

                        <td>{p.categoria?.nombre || "-"}</td>
                        <td>{p.unidadMedida || "-"}</td>
                        <td>{p.stockActual ?? 0}</td>
                        <td>{p.stockMinimo ?? 0}</td>
                        <td>{p.proveedor?.nombre || "-"}</td>

                        <td>
                          <Badge bg={est.color}>{est.txt}</Badge>
                        </td>

                        <td className="text-center">
                          <Button
                            as={Link}
                            to={`/muebles/${p._id}/editar`}
                            variant="outline-primary"
                            size="sm"
                            title="Editar"
                          >
                            <FiEdit />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StockMuebles;
