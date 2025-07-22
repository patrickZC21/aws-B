// src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';

// Middleware para verificar el token JWT
export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Verifica si el token existe
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no haya expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    req.usuario = decoded; // adjunta los datos del usuario al request
    next();
  } catch (err) {
    console.error('Error de verificación de token:', err.message);
    
    // Manejar diferentes tipos de errores JWT
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token malformado' });
    } else if (err.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token no válido aún' });
    }
    
    return res.status(401).json({ error: 'Token inválido' });
  }
};
