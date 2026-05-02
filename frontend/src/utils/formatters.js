// frontend/src/utils/formatters.js
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
};

export const formatearFechaHora = (fecha) => {
  if (!fecha) return '-';
  return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
};

export const formatearNumero = (numero) => {
  if (!numero && numero !== 0) return '-';
  return new Intl.NumberFormat('es-CO').format(numero);
};

export const formatearMoneda = (valor) => {
  if (!valor && valor !== 0) return '-';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};
