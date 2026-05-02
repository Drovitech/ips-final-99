// frontend/src/components/layout/Layout.js
import { useState } from 'react';
import { Container, Navbar, Nav, Offcanvas, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiHome, FiBox, FiTrendingUp, FiTrendingDown,
  FiUsers, FiShoppingCart, FiFileText, FiMenu,
  FiSettings, FiLogOut, FiUser, FiPackage
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { tienePermiso } from '../../utils/permisos';

const Layout = ({ children }) => {
  const [mostrarSidebar, setMostrarSidebar] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      titulo: 'Dashboard',
      icono: <FiHome />,
      ruta: '/dashboard',
      modulo: null
    },
    {
      titulo: 'Productos',
      icono: <FiBox />,
      ruta: '/productos',
      modulo: 'productos'
    },

    // ✅ NUEVO ITEM: Stock de muebles
    {
      titulo: 'Stock de muebles',
      icono: <FiPackage />,
      ruta: '/muebles',
      modulo: 'productos' // usa el mismo permiso de productos (ver)
    },

    {
      titulo: 'Entradas',
      icono: <FiTrendingUp />,
      ruta: '/entradas',
      modulo: 'entradas'
    },
    {
      titulo: 'Salidas',
      icono: <FiTrendingDown />,
      ruta: '/salidas',
      modulo: 'salidas'
    },
    {
      titulo: 'Proveedores',
      icono: <FiShoppingCart />,
      ruta: '/proveedores',
      modulo: 'proveedores'
    },
    {
      titulo: 'Reportes',
      icono: <FiFileText />,
      ruta: '/reportes',
      modulo: 'reportes'
    },
    {
      titulo: 'Usuarios',
      icono: <FiUsers />,
      ruta: '/usuarios',
      modulo: 'usuarios',
      soloAdmin: true
    },
    {
      titulo: 'Configuración',
      icono: <FiSettings />,
      ruta: '/configuracion',
      modulo: 'ajustes',
      soloAdmin: true
    }
  ];

  const menuFiltrado = menuItems.filter(item => {
    if (item.soloAdmin && usuario?.rol !== 'Administrador') return false;
    if (item.modulo && !tienePermiso(usuario, item.modulo, 'ver')) return false;
    return true;
  });

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="primary" variant="dark" className="shadow-sm">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <FiMenu
              size={24}
              className="me-3 cursor-pointer"
              onClick={() => setMostrarSidebar(true)}
              style={{ cursor: 'pointer' }}
            />
            <span className="fw-bold">IPS Salud+</span>
          </Navbar.Brand>

          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-white text-decoration-none">
                <div className="d-flex align-items-center">
                  <div className="me-2 text-end d-none d-md-block">
                    <div className="fw-bold">{usuario?.nombreCompleto}</div>
                    <small className="text-white-50">{usuario?.rol}</small>
                  </div>
                  <div
                    className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <FiUser size={20} />
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/perfil">
                  <FiUser className="me-2" />
                  Mi Perfil
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FiLogOut className="me-2" />
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* Sidebar */}
      <Offcanvas show={mostrarSidebar} onHide={() => setMostrarSidebar(false)}>
        <Offcanvas.Header closeButton className="bg-primary text-white">
          <Offcanvas.Title className="fw-bold">Gestión de Inventario</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            {menuFiltrado.map((item, index) => (
              <Nav.Link
                key={index}
                as={Link}
                to={item.ruta}
                className="px-4 py-3 text-dark d-flex align-items-center"
                onClick={() => setMostrarSidebar(false)}
                style={{
                  transition: 'all 0.2s',
                  borderLeft: '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderLeftColor = '#0d6efd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderLeftColor = 'transparent';
                }}
              >
                <span className="me-3">{item.icono}</span>
                <span>{item.titulo}</span>
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Contenido principal */}
      <main className="flex-grow-1 bg-light">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-top py-3 mt-auto">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              © 2026 IPS Salud+ - Sistema de Gestión de Inventario
            </small>
            <small className="text-muted">
              Versión 4.0.0
            </small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
