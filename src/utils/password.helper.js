import bcrypt from 'bcrypt';

// Función para encriptar contraseñas (OPTIMIZADA)
export const encriptarPassword = async (password) => {
  const saltRounds = 10; // ⚡ Optimizado de 12 a 10 para mejor rendimiento
  return await bcrypt.hash(password, saltRounds);
};

// Función para comparar contraseñas (OPTIMIZADA)
export const compararPassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('❌ [PASSWORD] Error en comparación:', error.message);
    return false;
  }
};

// Función para validar fuerza de contraseña
export const validarPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valida: false, mensaje: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!hasUpperCase) {
    return { valida: false, mensaje: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  
  if (!hasLowerCase) {
    return { valida: false, mensaje: 'La contraseña debe contener al menos una letra minúscula' };
  }
  
  if (!hasNumbers) {
    return { valida: false, mensaje: 'La contraseña debe contener al menos un número' };
  }
  
  if (!hasSpecialChar) {
    return { valida: false, mensaje: 'La contraseña debe contener al menos un carácter especial' };
  }

  return { valida: true, mensaje: 'Contraseña válida' };
};
