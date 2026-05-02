// frontend/src/components/productos/ListaProductos.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Button,
  Form, InputGroup, Badge, Pagination
} from 'react-bootstrap';
import { FiSearch, FiPlus, FiEdit, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { formatearNumero } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { tienePermiso } from '../../utils/permisos';

const ListaProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    search: '',
    categoria: '',
    tipoServicio: '',
    page: 1
  });
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();

  const cargarCategorias = useCallback(async () => {
    try {
      const cats = await categoriaService.obtenerCategorias();
      setCategorias(cats || []);
    } catch (e) {
      console.error('Error cargando categorías:', e);
      setCategorias([]);
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await productoService.obtenerProductos(filtros);
      setProductos(data.productos || []);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
      setTotalPaginas(1);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);
  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const handleBuscar = (e) => {
    setFiltros((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor, page: 1 }));
  };

  const obtenerEstadoStock = (producto) => {
    const stockActual = Number(producto.stockActual || 0);
    const stockMinimo = Number(producto.stockMinimo || 0);

    if (stockActual === 0) return { texto: 'Agotado', color: 'danger' };
    if (stockActual <= stockMinimo) return { texto: 'Stock bajo', color: 'warning' };
    return { texto: 'Normal', color: 'success' };
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Productos</h2>

        {tienePermiso(usuario, 'productos', 'crear') && (
          <Button as={Link} to="/productos/nuevo" variant="primary">
            <FiPlus className="me-2" />
            Nuevo Producto
          </Button>
        )}
      </div>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><FiSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar producto..."
                  value={filtros.search}
                  onChange={handleBuscar}
                />
              </InputGroup>
            </Col>

            <Col md={4}>
              <Form.Select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Select
                value={filtros.tipoServicio}
                onChange={(e) => handleFiltroChange('tipoServicio', e.target.value)}
              >
                <option value="">Todos los servicios</option>
                <option value="Odontología">Odontología</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Farmacia">Farmacia</option>
                <option value="Sueroterapia">Sueroterapia</option>
                <option value="Urgencias">Urgencias</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiAlertCircle size={48} className="mb-3" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Servicio</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                    {tienePermiso(usuario, 'productos', 'editar') && (
                      <th className="text-center">Acciones</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {productos.map((producto) => {
                    const estado = obtenerEstadoStock(producto);

                    return (
                      <tr key={producto._id}>
                        <td className="fw-semibold">{producto.nombre}</td>
                        <td>{producto.categoria?.nombre || '-'}</td>
                        <td>{producto.tipoServicio || '-'}</td>

                        <td>
                          <span className={`fw-bold ${
                            Number(producto.stockActual || 0) <= Number(producto.stockMinimo || 0)
                              ? 'text-danger' : ''
                          }`}>
                            {formatearNumero(producto.stockActual || 0)}
                          </span>{' '}
                          {producto.unidadMedida}
                        </td>

                        <td>
                          {formatearNumero(producto.stockMinimo || 0)} {producto.unidadMedida}
                        </td>

                        <td>{producto.proveedor?.nombre || '-'}</td>

                        <td>
                          <Badge bg={estado.color}>{estado.texto}</Badge>
                        </td>

                        {tienePermiso(usuario, 'productos', 'editar') && (
                          <td className="text-center">
                            {/* ✅ ESTA ES LA RUTA CORRECTA */}
                            <Button
  as={Link}
  to={`/productos/editar/${producto._id}`}
  variant="outline-primary"
  size="sm"
>
  <FiEdit />
</Button>

                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {totalPaginas > 1 && (
                <div className="d-flex justify-content-center p-3 border-top">
                  <Pagination>
                    <Pagination.Prev
                      disabled={filtros.page === 1}
                      onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page - 1 }))}
                    />
                    {[...Array(totalPaginas)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={filtros.page === index + 1}
                        onClick={() => setFiltros((prev) => ({ ...prev, page: index + 1 }))}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={filtros.page === totalPaginas}
                      onClick={() => setFiltros((prev) => ({ ...prev, page: prev.page + 1 }))}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ListaProductos;
