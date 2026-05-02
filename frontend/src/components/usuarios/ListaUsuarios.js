// frontend/src/components/usuarios/ListaUsuarios.js
import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import FormularioUsuario from './FormularioUsuario';
import TablaPermisos from './TablaPermisos';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await api.get('/usuarios');
      setUsuarios(res.data.usuarios || []);
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: 'danger',
        texto: 'Error al cargar usuarios'
      });
    } finally {
      setCargando(false);
    }
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setMostrarModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

  const handleEliminarUsuario = async (usuario) => {
    if (usuario.email === 'admin@ipssalud.com') {
      alert('No puedes eliminar el administrador principal');
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar a ${usuario.nombreCompleto}?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${usuario._id}`);
      alert('Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || 'Error al eliminar usuario');
    }
  };

  const handleToggleEstado = async (usuario) => {
    if (usuario.email === 'admin@ipssalud.com' && usuario.activo) {
      alert('No puedes desactivar el administrador principal');
      return;
    }

    const confirmar = window.confirm(
      `¿Deseas ${usuario.activo ? 'desactivar' : 'activar'} este usuario?`
    );

    if (!confirmar) return;

    try {
      await api.put(`/usuarios/${usuario._id}`, {
        activo: !usuario.activo
      });
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert('Error al cambiar estado');
    }
  };

  const getRolColor = (rol) => {
    const map = {
      Administrador: 'danger',
      Enfermería: 'info',
      Almacén: 'warning',
      Farmacia: 'success',
      Auditor: 'secondary'
    };
    return map[rol] || 'primary';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-CO');
  };

  return (
    <>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">Gestión de Usuarios</h2>
            <p className="text-muted">Administración del sistema</p>
          </div>
          <Button onClick={handleNuevoUsuario}>
            <FiPlus className="me-2" />
            Nuevo Usuario
          </Button>
        </div>

        {mensaje.texto && (
          <Alert
            variant={mensaje.tipo}
            dismissible
            onClose={() => setMensaje({ tipo: '', texto: '' })}
          >
            {mensaje.texto}
          </Alert>
        )}

        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            {cargando ? (
              <div className="text-center py-5">Cargando...</div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Último acceso</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <FiShield size={40} className="mb-2 opacity-25" />
                        <p>No hay usuarios</p>
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u._id}>
                        <td>{u.nombreCompleto}</td>
                        <td>{u.email}</td>
                        <td>
                          <Badge bg={getRolColor(u.rol)}>
                            {u.rol}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={u.activo ? 'success' : 'secondary'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleToggleEstado(u)}
                          >
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td>{formatearFecha(u.ultimoAcceso)}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleEditarUsuario(u)}
                          >
                            <FiEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleEliminarUsuario(u)}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        <TablaPermisos />
      </Container>

      <FormularioUsuario
        show={mostrarModal}
        handleClose={() => {
          setMostrarModal(false);
          setUsuarioEditar(null);
        }}
        usuarioEditar={usuarioEditar}
        onUsuarioCreado={cargarUsuarios}
      />
    </>
  );
};

export default ListaUsuarios;
