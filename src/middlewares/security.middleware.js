import rateLimit from 'express-rate-limit';
import helmet from 'helmet';



// Rate limiting general para API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Más permisivo en desarrollo
  message: {
    error: 'Demasiadas peticiones. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de helmet para headers de seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      // Permitir iframes en desarrollo, bloquear en producción
      frameSrc: process.env.NODE_ENV === 'development' ? ["'self'", "http://localhost:*"] : ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Necesario para algunos casos de CORS
  // Configurar X-Frame-Options para permitir iframes en desarrollo
  frameguard: process.env.NODE_ENV === 'development' ? { action: 'sameorigin' } : { action: 'deny' },
});
