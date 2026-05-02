// frontend/src/components/usuarios/TablaPermisos.js
import { Card, Table, Badge } from 'react-bootstrap';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';

const TablaPermisos = () => {
  const permisos = [
    {
      modulo: 'Productos',
      administrador: ['Ver', 'Crear', 'Editar', 'Eliminar'],
      enfermeria: ['Ver'],
      almacen: ['Ver', 'Crear', 'Editar'],
      farmacia: ['Ver', 'Crear', 'Editar'],
      auditor: ['Ver']
    },
    {
      modulo: 'Entradas',
      administrador: ['Ver', 'Crear', 'Editar'],
      enfermeria: ['Ver'],
      almacen: ['Ver', 'Crear', 'Editar'],
      farmacia: ['Ver', 'Crear'],
      auditor: ['Ver']
    },
    {
      modulo: 'Salidas',
      administrador: ['Ver', 'Crear', 'Editar'],
      enfermeria: ['Ver', 'Crear'],
      almacen: ['Ver', 'Crear'],
      farmacia: ['Ver', 'Crear'],
      auditor: ['Ver']
    },
    {
      modulo: 'Proveedores',
      administrador: ['Ver', 'Crear', 'Editar', 'Eliminar'],
      enfermeria: ['Ver'],
      almacen: ['Ver', 'Crear', 'Editar'],
      farmacia: ['Ver'],
      auditor: ['Ver']
    },
    {
      modulo: 'Usuarios',
      administrador: ['Ver', 'Crear', 'Editar', 'Eliminar'],
      enfermeria: [],
      almacen: [],
      farmacia: [],
      auditor: []
    },
    {
      modulo: 'Reportes',
      administrador: ['Ver', 'Exportar'],
      enfermeria: ['Ver'],
      almacen: ['Ver', 'Exportar'],
      farmacia: ['Ver', 'Exportar'],
      auditor: ['Ver', 'Exportar']
    },
    {
      modulo: 'Configuración',
      administrador: ['Ver', 'Editar'],
      enfermeria: [],
      almacen: [],
      farmacia: [],
      auditor: []
    },
    {
      modulo: 'Historial de Logs',
      administrador: ['Ver'],
      enfermeria: [],
      almacen: [],
      farmacia: [],
      auditor: ['Ver']
    }
  ];

  const roles = [
    { key: 'administrador', nombre: 'Administrador', color: 'danger' },
    { key: 'enfermeria', nombre: 'Enfermería', color: 'info' },
    { key: 'almacen', nombre: 'Almacén', color: 'warning' },
    { key: 'farmacia', nombre: 'Farmacia', color: 'success' },
    { key: 'auditor', nombre: 'Auditor', color: 'secondary' }
  ];

  const renderPermisos = (permisosRol) => {
    if (!permisosRol || permisosRol.length === 0) {
      return (
        <div className="text-center text-muted">
          <FiX size={18} />
        </div>
      );
    }

    return (
      <div className="d-flex flex-wrap gap-1 justify-content-center">
        {permisosRol.map((permiso, index) => (
          <Badge 
            key={index}
            bg={permiso === 'Ver' ? 'secondary' : 'success'}
            style={{ fontSize: '0.7rem' }}
            pill
          >
            {permiso === 'Ver' && <FiEye size={10} className="me-1" />}
            {permiso === 'Crear' && <FiCheck size={10} className="me-1" />}
            {permiso}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-sm mt-4">
      <Card.Header className="bg-white border-bottom">
        <h5 className="fw-bold mb-0">
          Matriz de Permisos por Rol
        </h5>
        <p className="text-muted small mb-0 mt-1">
          Tabla completa de permisos asignados a cada rol del sistema
        </p>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table bordered hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3" style={{ minWidth: '150px' }}>Módulo</th>
                {roles.map(rol => (
                  <th key={rol.key} className="text-center px-3 py-3" style={{ minWidth: '140px' }}>
                    <Badge bg={rol.color} className="mb-1">
                      {rol.icono} {rol.nombre}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permisos.map((permiso, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 fw-semibold">{permiso.modulo}</td>
                  {roles.map(rol => (
                    <td key={rol.key} className="text-center px-3 py-3">
                      {renderPermisos(permiso[rol.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      <Card.Footer className="bg-light">
        <div className="row g-2">
          <div className="col-auto">
            <span className="small">
              <Badge bg="secondary" pill className="me-2">
                <FiEye size={10} className="me-1" />
                Ver
              </Badge>
              Solo lectura
            </span>
          </div>
          <div className="col-auto">
            <span className="small">
              <Badge bg="success" pill className="me-2">
                <FiCheck size={10} className="me-1" />
                Crear/Editar
              </Badge>
              Modificación permitida
            </span>
          </div>
          <div className="col-auto">
            <span className="small">
              <FiX className="text-muted me-2" />
              Sin acceso al módulo
            </span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default TablaPermisos;