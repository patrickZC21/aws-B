// Utilidad para logs limpios y condicionales
export const logger = {
  // Solo en desarrollo
  dev: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  
  // Solo errores (siempre)
  error: (...args) => {
    console.error('❌', ...args);
  },
  
  // Información importante (siempre)
  info: (...args) => {
    console.log('ℹ️', ...args);
  },
  
  // Advertencias (siempre)
  warn: (...args) => {
    console.warn('⚠️', ...args);
  },
  
  // Éxito (siempre)
  success: (...args) => {
    console.log('✅', ...args);
  }
};

export default logger;
