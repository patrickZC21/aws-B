import helmet from 'helmet';

// Rate limiting COMPLETAMENTE DESHABILITADO
// Middleware que no hace nada - permite todas las peticiones
export const loginLimiter = (req, res, next) => {
  next();
};

// Rate limiting general COMPLETAMENTE DESHABILITADO
export const apiLimiter = (req, res, next) => {
  next();
};

// Configuración de helmet para headers de seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      // Permitir conexiones al frontend y localhost
      connectSrc: [
        "'self'",
        process.env.FRONTEND_URL || "https://d23z3xo2l9ntjm.cloudfront.net",
        "http://localhost:*"
      ].filter(Boolean),
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      // Permitir iframes en desarrollo, bloquear en producción
      frameSrc: process.env.NODE_ENV === 'development' ? ["'self'", "http://localhost:*"] : ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Necesario para algunos casos de CORS
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir recursos cross-origin
  // Configurar X-Frame-Options para permitir iframes en desarrollo
  frameguard: process.env.NODE_ENV === 'development' ? { action: 'sameorigin' } : { action: 'deny' },
});
