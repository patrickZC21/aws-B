import * as AuthService from '../services/auth.service.js';
import jwt from "jsonwebtoken";

// ✅ LOGIN OPTIMIZADO
export const login = async (req, res) => {
  const { correo, contraseña } = req.body;
  
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    // ⚡ Solo logging en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log('� [AUTH] Login request:', correo);
    }
    
    const result = await AuthService.login(correo, contraseña);
    
    if (result.error) return res.status(result.code).json({ error: result.error });
    res.json(result);
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ✅ VALIDAR TOKEN
export const validarToken = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ usuario: decoded });
  } catch (error) {
    console.error("Error al validar token:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    const userId = req.usuario?.id; // Del middleware de autenticación
    
    if (!userId) {
      return res.status(400).json({ error: 'Usuario no identificado' });
    }

    const result = await AuthService.logout(userId);
    
    if (result.error) {
      return res.status(result.code).json({ error: result.error });
    }

    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error("❌ Error en logout:", error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ✅ FORZAR DESCONEXIÓN (para admins)
export const forzarDesconexion = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    const result = await AuthService.forzarDesconexion(userId);
    
    if (result.error) {
      return res.status(result.code).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("❌ Error en forzarDesconexion:", error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ✅ FORZAR LOGOUT POR CORREO (para resolver conflictos de sesión)
export const forzarLogoutPorCorreo = async (req, res) => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      return res.status(400).json({ error: 'Correo es requerido' });
    }

    const result = await AuthService.forzarLogoutPorCorreo(correo);
    
    if (result.error) {
      return res.status(result.code).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("❌ Error en forzarLogoutPorCorreo:", error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
