// Middleware de manejo de errores global
export const manejarErrores = (err, req, res, next) => {
  // Log del error (en producción usar un sistema de logging profesional)
  console.error('❌ Error capturado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: process.env.NODE_ENV === 'development' ? err.message : 'Datos inválidos'
    });
  }

  // Errores de base de datos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Recurso duplicado',
      detalle: 'El recurso que intentas crear ya existe'
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido'
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
};
