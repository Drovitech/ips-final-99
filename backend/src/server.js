require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

const connectDB = require("./config/database");
const { securityHeaders, generalLimiter } = require("./middleware/security");
const { errorHandler } = require("./middleware/errorHandler");

// ==============================
// Conectar base de datos
// ==============================
connectDB();

const app = express();

// ==============================
// Seguridad
// ==============================
app.use(securityHeaders);
app.use(generalLimiter);

// ==============================
// CORS (FIX PRE-FLIGHT 🔥)
// ==============================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 👉 Responder SIEMPRE preflight
app.options("*", cors());

// ==============================
// Body parser
// ==============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Logs
// ==============================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ==============================
// Performance
// ==============================
app.use(compression());

// ==============================
// Rutas API
// ==============================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/productos", require("./routes/productos"));
app.use("/api/entradas", require("./routes/entradas"));
app.use("/api/salidas", require("./routes/salidas"));
app.use("/api/proveedores", require("./routes/proveedores"));
app.use("/api/lotes", require("./routes/lotes"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/reportes", require("./routes/reportes"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/historial", require("./routes/historial"));
app.use("/api/categorias", require("./routes/categorias"));
app.use("/api/info-ips", require("./routes/infoIps"));
app.use("/api/system", require("./routes/system"));

// ==============================
// Health check
// ==============================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    mensaje: "API funcionando correctamente",
    timestamp: new Date(),
  });
});

// ==============================
// Error handler
// ==============================
app.use(errorHandler);

// ==============================
// 404 API
// ==============================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    mensaje: "Ruta no encontrada",
  });
});

// ==============================
// Server
// ==============================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${PORT} en modo ${process.env.NODE_ENV}`
  );
});

// ==============================
// Errores fatales
// ==============================
process.on("unhandledRejection", (err) => {
  console.error("Error no controlado:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Excepción no capturada:", err);
  process.exit(1);
});
