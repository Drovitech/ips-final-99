// backend/src/middleware/security.js
// ============================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración de seguridad con helmet
exports.securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
});

// Limitar intentos de login
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    mensaje: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos'
  }
});

// Limitar requests en general
exports.generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100 // 100 requests
});