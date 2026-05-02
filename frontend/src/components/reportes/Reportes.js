// frontend/src/components/reportes/Reportes.jsx
import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { FiDownload } from "react-icons/fi";

import { productoService } from "../../services/productoService";
import { reporteService } from "../../services/reporteService";

// CSV seguro
const csvSafe = (value) => {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
};

const obtenerEstadoStock = (stockActual, stockMinimo) => {
  const sa = Number(stockActual || 0);
  const sm = Number(stockMinimo || 0);
  if (sa === 0) return "Agotado";
  if (sa <= sm) return "Stock bajo";
  return "Normal";
};

const descargarCSV = (rows, nombreArchivo) => {
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", nombreArchivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Helper: siempre devuelve array
const toArray = (v) => (Array.isArray(v) ? v : []);

export default function Reportes() {
  const [generandoStock, setGenerandoStock] = useState(false);
  const [generandoMovimientos, setGenerandoMovimientos] = useState(false);
  const [generandoInventario, setGenerandoInventario] = useState(false);
  const [generandoCritico, setGenerandoCritico] = useState(false);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // ==========================
  // 1) Stock de Productos (solo stockActual > 0)
  // ==========================
  const generarReporteStockProductos = async () => {
    setError("");
    setOk("");
    setGenerandoStock(true);

    try {
      let page = 1;
      let totalPaginas = 1;
      const todos = [];

      do {
        const data = await productoService.obtenerProductos({
          search: "",
          categoria: "",
          tipoServicio: "",
          page,
        });

        const productos = toArray(data?.productos);
        totalPaginas = Number(data?.totalPaginas || 1);

        todos.push(...productos);
        page += 1;
      } while (page <= totalPaginas);

      const enStock = todos.filter((p) => Number(p.stockActual || 0) > 0);

      if (enStock.length === 0) {
        setError("No hay productos en stock para generar el reporte.");
        return;
      }

      const encabezado = [
        "Producto",
        "Categoría",
        "Servicio",
        "Unidad",
        "Stock Actual",
        "Stock Mínimo",
        "Proveedor",
        "Estado",
      ].join(";");

      const filas = enStock.map((p) => {
        const nombre =
          p.nombre || `${p.productoBase || ""} - ${p.variante || ""}`.trim();
        const categoria = p.categoria?.nombre || p.categoria || "";
        const servicio = p.tipoServicio || "";
        const unidad = p.unidadMedida || "";
        const stockActual = Number(p.stockActual || 0);
        const stockMinimo = Number(p.stockMinimo || 0);
        const proveedor = p.proveedor?.nombre || p.proveedor || "";
        const estado = obtenerEstadoStock(stockActual, stockMinimo);

        return [
          csvSafe(nombre),
          csvSafe(categoria),
          csvSafe(servicio),
          csvSafe(unidad),
          csvSafe(stockActual),
          csvSafe(stockMinimo),
          csvSafe(proveedor),
          csvSafe(estado),
        ].join(";");
      });

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");

      descargarCSV(
        [encabezado, ...filas],
        `reporte_stock_productos_${yyyy}-${mm}-${dd}.csv`
      );
      setOk(`Reporte generado ✅ (${enStock.length} productos en stock)`);
    } catch (e) {
      console.error(e);
      setError("Error generando el reporte de Stock de Productos.");
    } finally {
      setGenerandoStock(false);
    }
  };

  // ==========================
  // 2) Reporte de Movimientos (✅ FIX DEFINITIVO)
  // Usa backend: GET /reportes/movimientos -> { success, datos: [] }
  // ==========================
  const generarReporteMovimientos = async () => {
    setError("");
    setOk("");
    setGenerandoMovimientos(true);

    try {
      const res = await reporteService.obtenerMovimientos();
      const datos = toArray(res?.datos);

      if (datos.length === 0) {
        setError("No hay movimientos para generar el reporte.");
        return;
      }

      // Normalizar a una estructura estable
      const movimientos = datos.map((x) => {
        const tipo = (x.tipo || "").toLowerCase() === "entrada" ? "Entrada" : "Salida";

        const fecha = x.fecha || x.createdAt || "";
        const producto =
          x.producto?.nombre ||
          `${x.producto?.productoBase || ""} ${x.producto?.variante || ""}`.trim() ||
          x.producto ||
          "";

        const lote = x.lote?.codigo || x.lote?.numero || x.lote || "";
        const cantidad = Number(x.cantidad || 0);

        const responsable =
          x.responsable ||
          x.usuario?.nombreCompleto ||
          x.usuario ||
          "";

        const motivo =
          x.tipoIngreso ||
          x.motivo ||
          x.detalle ||
          "";

        return { tipo, fecha, producto, lote, cantidad, responsable, motivo };
      });

      // Ordenar por fecha desc
      movimientos.sort((a, b) => {
        const da = a.fecha ? new Date(a.fecha).getTime() : 0;
        const db = b.fecha ? new Date(b.fecha).getTime() : 0;
        return db - da;
      });

      const encabezado = [
        "Tipo",
        "Fecha",
        "Producto",
        "Lote",
        "Cantidad",
        "Responsable/Usuario",
        "Motivo/Detalle",
      ].join(";");

      const filas = movimientos.map((m) =>
        [
          csvSafe(m.tipo),
          csvSafe(m.fecha),
          csvSafe(m.producto),
          csvSafe(m.lote),
          csvSafe(m.cantidad),
          csvSafe(m.responsable),
          csvSafe(m.motivo),
        ].join(";")
      );

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");

      descargarCSV(
        [encabezado, ...filas],
        `reporte_movimientos_${yyyy}-${mm}-${dd}.csv`
      );
      setOk(`Reporte generado ✅ (${movimientos.length} movimientos)`);
    } catch (e) {
      console.error(e);
      setError("Error generando el Reporte de Movimientos.");
    } finally {
      setGenerandoMovimientos(false);
    }
  };

  // ==========================
  // 3) Inventario Actual (usa /productos paginado)
  // ==========================
  const generarReporteInventarioActual = async () => {
    setError("");
    setOk("");
    setGenerandoInventario(true);

    try {
      let page = 1;
      let totalPaginas = 1;
      const todos = [];

      do {
        const data = await productoService.obtenerProductos({
          search: "",
          categoria: "",
          tipoServicio: "",
          page,
        });

        const productos = toArray(data?.productos);
        totalPaginas = Number(data?.totalPaginas || 1);

        todos.push(...productos);
        page += 1;
      } while (page <= totalPaginas);

      if (todos.length === 0) {
        setError("No hay productos registrados para generar el inventario.");
        return;
      }

      const encabezado = [
        "Producto",
        "Categoría",
        "Servicio",
        "Unidad",
        "Stock Actual",
        "Stock Mínimo",
        "Proveedor",
        "Estado",
        "Activo",
      ].join(";");

      const filas = todos.map((p) => {
        const nombre =
          p.nombre || `${p.productoBase || ""} - ${p.variante || ""}`.trim();
        const categoria = p.categoria?.nombre || p.categoria || "";
        const servicio = p.tipoServicio || "";
        const unidad = p.unidadMedida || "";
        const stockActual = Number(p.stockActual || 0);
        const stockMinimo = Number(p.stockMinimo || 0);
        const proveedor = p.proveedor?.nombre || p.proveedor || "";
        const estado = obtenerEstadoStock(stockActual, stockMinimo);
        const activo = p.activo === false ? "No" : "Sí";

        return [
          csvSafe(nombre),
          csvSafe(categoria),
          csvSafe(servicio),
          csvSafe(unidad),
          csvSafe(stockActual),
          csvSafe(stockMinimo),
          csvSafe(proveedor),
          csvSafe(estado),
          csvSafe(activo),
        ].join(";");
      });

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");

      descargarCSV(
        [encabezado, ...filas],
        `reporte_inventario_actual_${yyyy}-${mm}-${dd}.csv`
      );
      setOk(`Reporte generado ✅ (${todos.length} ítems)`);
    } catch (e) {
      console.error(e);
      setError("Error generando el reporte de Inventario Actual.");
    } finally {
      setGenerandoInventario(false);
    }
  };

  // ==========================
  // 4) Stock Crítico
  // ==========================
  const generarReporteStockCritico = async () => {
    setError("");
    setOk("");
    setGenerandoCritico(true);

    try {
      let page = 1;
      let totalPaginas = 1;
      const todos = [];

      do {
        const data = await productoService.obtenerProductos({
          search: "",
          categoria: "",
          tipoServicio: "",
          page,
        });

        const productos = toArray(data?.productos);
        totalPaginas = Number(data?.totalPaginas || 1);

        todos.push(...productos);
        page += 1;
      } while (page <= totalPaginas);

      const criticos = todos.filter((p) => {
        const sa = Number(p.stockActual || 0);
        const sm = Number(p.stockMinimo || 0);
        return sa === 0 || sa <= sm;
      });

      if (criticos.length === 0) {
        setError("No hay productos en stock crítico.");
        return;
      }

      criticos.sort((a, b) => {
        const ea = obtenerEstadoStock(a.stockActual, a.stockMinimo);
        const eb = obtenerEstadoStock(b.stockActual, b.stockMinimo);
        const score = (x) => (x === "Agotado" ? 0 : x === "Stock bajo" ? 1 : 2);
        return score(ea) - score(eb);
      });

      const encabezado = [
        "Producto",
        "Categoría",
        "Servicio",
        "Unidad",
        "Stock Actual",
        "Stock Mínimo",
        "Proveedor",
        "Estado",
      ].join(";");

      const filas = criticos.map((p) => {
        const nombre =
          p.nombre || `${p.productoBase || ""} - ${p.variante || ""}`.trim();
        const categoria = p.categoria?.nombre || p.categoria || "";
        const servicio = p.tipoServicio || "";
        const unidad = p.unidadMedida || "";
        const stockActual = Number(p.stockActual || 0);
        const stockMinimo = Number(p.stockMinimo || 0);
        const proveedor = p.proveedor?.nombre || p.proveedor || "";
        const estado = obtenerEstadoStock(stockActual, stockMinimo);

        return [
          csvSafe(nombre),
          csvSafe(categoria),
          csvSafe(servicio),
          csvSafe(unidad),
          csvSafe(stockActual),
          csvSafe(stockMinimo),
          csvSafe(proveedor),
          csvSafe(estado),
        ].join(";");
      });

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");

      descargarCSV(
        [encabezado, ...filas],
        `reporte_stock_critico_${yyyy}-${mm}-${dd}.csv`
      );
      setOk(`Reporte generado ✅ (${criticos.length} productos en stock crítico)`);
    } catch (e) {
      console.error(e);
      setError("Error generando el reporte de Stock Crítico.");
    } finally {
      setGenerandoCritico(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="fw-bold mb-4">Reportes</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {ok && <Alert variant="success">{ok}</Alert>}

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold mb-1">Reporte de Movimientos</h5>
                <small className="text-muted">Entradas y salidas por período</small>
              </div>
              <Button
                variant="outline-primary"
                onClick={generarReporteMovimientos}
                disabled={generandoMovimientos}
              >
                <FiDownload className="me-2" />
                {generandoMovimientos ? "Generando..." : "Generar Reporte"}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold mb-1">Inventario Actual</h5>
                <small className="text-muted">Estado actual del inventario</small>
              </div>
              <Button
                variant="outline-success"
                onClick={generarReporteInventarioActual}
                disabled={generandoInventario}
              >
                <FiDownload className="me-2" />
                {generandoInventario ? "Generando..." : "Generar Reporte"}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold mb-1">Stock de Productos</h5>
                <small className="text-muted">Todos los productos en stock</small>
              </div>
              <Button
                variant="outline-warning"
                onClick={generarReporteStockProductos}
                disabled={generandoStock}
              >
                <FiDownload className="me-2" />
                {generandoStock ? "Generando..." : "Generar Reporte"}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="fw-bold mb-1">Stock Crítico</h5>
                <small className="text-muted">Productos con stock bajo</small>
              </div>
              <Button
                variant="outline-danger"
                onClick={generarReporteStockCritico}
                disabled={generandoCritico}
              >
                <FiDownload className="me-2" />
                {generandoCritico ? "Generando..." : "Generar Reporte"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
