// Middleware simple de validación de campos requeridos
export const validarCamposRequeridos = (campos) => {
  return (req, res, next) => {
    const errores = [];

    campos.forEach((campo) => {
      if (!req.body[campo]) {
        errores.push(`El campo '${campo}' es obligatorio`);
      }
    });

    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }

    next();
  };
};
