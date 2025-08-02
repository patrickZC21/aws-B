// Middleware para coordinadores
export const filtrarDatosCoordinador = (req, res, next) => {
  // Por ahora solo pasa al siguiente middleware
  next();
};

export const verificarPermisoCoordinador = (req, res, next) => {
  // Verificar si el usuario es coordinador
  next();
};
