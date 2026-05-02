// frontend/src/components/usuarios/FormularioUsuario.js
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Badge, Table } from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiShield, FiInfo } from 'react-icons/fi';
import api from '../../services/api';

const FormularioUsuario = ({ show, handleClose, usuarioEditar, onUsuarioCreado }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'Enfermería',
    activo: true
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [mostrarPermisos, setMostrarPermisos] = useState(false);

  // Configuración de permisos por rol
  const permisosRoles = {
    'Administrador': {
      icono: '',
      color: 'danger',
      descripcion: 'Permisos completos del sistema',
      permisos: [
        { modulo: 'Productos', acciones: 'Ver, Crear, Editar, Eliminar' },
        { modulo: 'Entradas', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Salidas', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Proveedores', acciones: 'Ver, Crear, Editar, Eliminar' },
        { modulo: 'Usuarios', acciones: 'Ver, Crear, Editar, Eliminar' },
        { modulo: 'Reportes', acciones: 'Ver, Exportar' },
        { modulo: 'Configuración', acciones: 'Ver, Editar' }
      ]
    },
    'Enfermería': {
      icono: '',
      color: 'info',
      descripcion: 'Enfocado en registro de salidas',
      permisos: [
        { modulo: 'Productos', acciones: 'Solo Ver' },
        { modulo: 'Entradas', acciones: 'Solo Ver' },
        { modulo: 'Salidas', acciones: 'Ver, Crear' },
        { modulo: 'Proveedores', acciones: 'Solo Ver' },
        { modulo: 'Reportes', acciones: 'Solo Ver' }
      ]
    },
    'Almacén': {
      icono: '',
      color: 'warning',
      descripcion: 'Gestión de inventario',
      permisos: [
        { modulo: 'Productos', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Entradas', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Salidas', acciones: 'Ver, Crear' },
        { modulo: 'Proveedores', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Reportes', acciones: 'Ver, Exportar' }
      ]
    },
    'Farmacia': {
      icono: '',
      color: 'success',
      descripcion: 'Gestión farmacéutica',
      permisos: [
        { modulo: 'Productos', acciones: 'Ver, Crear, Editar' },
        { modulo: 'Entradas', acciones: 'Ver, Crear' },
        { modulo: 'Salidas', acciones: 'Ver, Crear' },
        { modulo: 'Proveedores', acciones: 'Solo Ver' },
        { modulo: 'Reportes', acciones: 'Ver, Exportar' }
      ]
    },
    'Auditor': {
      icono: '',
      color: 'secondary',
      descripcion: 'Solo lectura y auditoría',
      permisos: [
        { modulo: 'Productos', acciones: 'Solo Ver' },
        { modulo: 'Entradas', acciones: 'Solo Ver' },
        { modulo: 'Salidas', acciones: 'Solo Ver' },
        { modulo: 'Proveedores', acciones: 'Solo Ver' },
        { modulo: 'Reportes', acciones: 'Ver, Exportar' },
        { modulo: 'Historial de Logs', acciones: 'Ver' }
      ]
    }
  };

  useEffect(() => {
    if (usuarioEditar) {
      setFormData({
        nombreCompleto: usuarioEditar.nombreCompleto || '',
        email: usuarioEditar.email || '',
        password: '',
        rol: usuarioEditar.rol || 'Enfermería',
        activo: usuarioEditar.activo !== undefined ? usuarioEditar.activo : true
      });
    } else {
      resetForm();
    }
  }, [usuarioEditar, show]);

  const resetForm = () => {
    setFormData({
      nombreCompleto: '',
      email: '',
      password: '',
      rol: 'Enfermería',
      activo: true
    });
    setErrores({});
    setMensaje({ tipo: '', texto: '' });
    setMostrarPermisos(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = 'El nombre completo es obligatorio';
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = 'Email no válido';
    }

    // Validar password solo si es creación o si se ingresó una nueva
    if (!usuarioEditar && !formData.password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (formData.password) {
      if (formData.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        nuevosErrores.password = 'Debe contener mayúsculas, minúsculas y números';
      }
    }

    if (!formData.rol) {
      nuevosErrores.rol = 'Debe seleccionar un rol';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const datosEnviar = { ...formData };
      
      // Si es edición y no se cambió la contraseña, no enviarla
      if (usuarioEditar && !formData.password) {
        delete datosEnviar.password;
      }

      if (usuarioEditar) {
        // Actualizar usuario existente
        await api.put(`/usuarios/${usuarioEditar._id}`, datosEnviar);
        setMensaje({ 
          tipo: 'success', 
          texto: 'Usuario actualizado correctamente' 
        });
      } else {
        // Crear nuevo usuario
        await api.post('/usuarios', datosEnviar);
        setMensaje({ 
          tipo: 'success', 
          texto: 'Usuario creado correctamente' 
        });
      }

      setTimeout(() => {
        onUsuarioCreado();
        handleClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Error al guardar usuario:', error);
      const mensajeError = error.response?.data?.mensaje || 
                          error.response?.data?.error ||
                          'Error al guardar el usuario';
      setMensaje({ tipo: 'danger', texto: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  const rolSeleccionado = permisosRoles[formData.rol];

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FiUser className="me-2" />
          {usuarioEditar ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {mensaje.texto && (
            <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
              {mensaje.texto}
            </Alert>
          )}

          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  <FiUser className="me-2" />
                  Nombre Completo *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  isInvalid={!!errores.nombreCompleto}
                  placeholder="Ej: Juan Pérez García"
                  disabled={cargando}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.nombreCompleto}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  <FiMail className="me-2" />
                  Email *
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errores.email}
                  placeholder="usuario@ipssalud.com"
                  disabled={cargando}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  <FiLock className="me-2" />
                  Contraseña {!usuarioEditar && '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errores.password}
                  placeholder={usuarioEditar ? "Dejar en blanco para mantener la actual" : "Mínimo 8 caracteres"}
                  disabled={cargando}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.password}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Debe contener al menos 8 caracteres, mayúsculas, minúsculas y números
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  <FiShield className="me-2" />
                  Rol del Usuario *
                </Form.Label>
                <Form.Select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  isInvalid={!!errores.rol}
                  disabled={cargando}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Enfermería">Enfermería</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Auditor">Auditor</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errores.rol}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Información del rol seleccionado */}
            {rolSeleccionado && (
              <Col md={12} className="mb-3">
                <div className="bg-light p-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <Badge bg={rolSeleccionado.color} className="me-2">
                        {rolSeleccionado.icono} {formData.rol}
                      </Badge>
                      <span className="text-muted">{rolSeleccionado.descripcion}</span>
                    </div>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setMostrarPermisos(!mostrarPermisos)}
                    >
                      <FiInfo className="me-1" />
                      {mostrarPermisos ? 'Ocultar' : 'Ver'} permisos
                    </Button>
                  </div>

                  {mostrarPermisos && (
                    <Table size="sm" className="mb-0 mt-2" bordered>
                      <thead>
                        <tr>
                          <th>Módulo</th>
                          <th>Permisos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rolSeleccionado.permisos.map((permiso, index) => (
                          <tr key={index}>
                            <td className="fw-semibold">{permiso.modulo}</td>
                            <td>
                              {permiso.acciones.split(', ').map((accion, idx) => (
                                <Badge 
                                  key={idx}
                                  bg={accion.includes('Solo') ? 'secondary' : 'success'}
                                  className="me-1"
                                  pill
                                >
                                  {accion}
                                </Badge>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Col>
            )}

            <Col md={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="activo"
                  label="Usuario activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  disabled={cargando}
                />
                <Form.Text className="text-muted">
                  Los usuarios inactivos no pueden iniciar sesión
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              handleClose();
              resetForm();
            }}
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Guardando...
              </>
            ) : (
              <>
                {usuarioEditar ? 'Actualizar' : 'Crear'} Usuario
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FormularioUsuario;