import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const manejarErroresValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: errors.array()
    });
  }
  next();
};

// Validaciones para login (más permisivas)
export const validarLogin = [
  body('correo')
    .isEmail()
    .withMessage('El correo debe tener un formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El correo es demasiado largo'),
  
  body('contraseña')
    .isLength({ min: 1, max: 128 })
    .withMessage('La contraseña es requerida'),
  
  manejarErroresValidacion
];

// Validaciones para crear usuario
export const validarCrearUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('correo')
    .isEmail()
    .withMessage('El correo debe tener un formato válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El correo es demasiado largo'),
  
  body('contraseña')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]*$/)
    .withMessage('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'),
  
  body('rol_id')
    .isInt({ min: 1 })
    .withMessage('El rol debe ser un número entero válido'),
  
  manejarErroresValidacion
];

// Validaciones para DNI
export const validarDNI = [
  body('dni')
    .isLength({ min: 8, max: 8 })
    .withMessage('El DNI debe tener exactamente 8 dígitos')
    .isNumeric()
    .withMessage('El DNI solo puede contener números'),
  
  manejarErroresValidacion
];

// Sanitización general para prevenir XSS
export const sanitizarInput = (req, res, next) => {
  // Sanitizar strings en el body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remover scripts y tags potencialmente peligrosos
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '') // Remover todos los tags HTML
          .trim();
      }
    }
  }
  next();
};
