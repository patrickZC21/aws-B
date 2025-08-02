-- Script de inicialización para base de datos local
-- Ejecutar este script para crear la estructura completa de la base de datos

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS asistencia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asistencia_db;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles básicos
INSERT INTO roles (id, nombre, descripcion) VALUES 
(1, 'USUARIO', 'Usuario básico del sistema'),
(2, 'ADMINISTRADOR', 'Administrador con acceso total'),
(3, 'COORDINADOR', 'Coordinador con acceso limitado por subalmacén')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tabla de almacenes
CREATE TABLE IF NOT EXISTS almacenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activo (activo)
);

-- Insertar almacenes de ejemplo
INSERT INTO almacenes (nombre, descripcion) VALUES 
('Almacén Central', 'Almacén principal de la empresa'),
('Almacén Norte', 'Almacén ubicado en la zona norte'),
('Almacén Sur', 'Almacén ubicado en la zona sur')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tabla de subalmacenes
CREATE TABLE IF NOT EXISTS subalmacenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  almacen_id INT NOT NULL,
  descripcion TEXT,
  refrigerio TIME,
  jornada VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_almacen (almacen_id),
  INDEX idx_activo (activo),
  FOREIGN KEY (almacen_id) REFERENCES almacenes(id) ON DELETE CASCADE
);

-- Insertar subalmacenes de ejemplo
INSERT INTO subalmacenes (nombre, almacen_id, descripcion) VALUES 
('Subalmacén A1', 1, 'Primer subalmacén del almacén central'),
('Subalmacén A2', 1, 'Segundo subalmacén del almacén central'),
('Subalmacén B1', 2, 'Primer subalmacén del almacén norte'),
('Subalmacén C1', 3, 'Primer subalmacén del almacén sur')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  ya_ingreso BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_correo (correo),
  INDEX idx_rol (rol_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(8) UNIQUE NOT NULL,
  subalmacen_id INT NOT NULL,
  coordinador_id INT,
  horas_objetivo INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dni (dni),
  INDEX idx_subalmacen (subalmacen_id),
  INDEX idx_coordinador (coordinador_id),
  FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id),
  FOREIGN KEY (coordinador_id) REFERENCES usuarios(id)
);

-- Tabla de programación de fechas
CREATE TABLE IF NOT EXISTS programacion_fechas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha DATE NOT NULL,
  subalmacen_id INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha_subalmacen (fecha, subalmacen_id),
  INDEX idx_subalmacen (subalmacen_id),
  UNIQUE KEY unique_fecha_subalmacen (fecha, subalmacen_id),
  FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id) ON DELETE CASCADE
);

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trabajador_id INT NOT NULL,
  subalmacen_id INT NOT NULL,
  hora_entrada TIME,
  hora_salida TIME,
  justificacion TEXT,
  registrado_por INT NOT NULL,
  programacion_fecha_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trabajador_fecha (trabajador_id, programacion_fecha_id),
  INDEX idx_subalmacen_fecha (subalmacen_id, programacion_fecha_id),
  INDEX idx_registrado_por (registrado_por),
  UNIQUE KEY unique_asistencia (trabajador_id, programacion_fecha_id),
  FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
  FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id),
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  FOREIGN KEY (programacion_fecha_id) REFERENCES programacion_fechas(id) ON DELETE CASCADE
);

-- Tabla de permisos de acceso a subalmacenes
CREATE TABLE IF NOT EXISTS usuario_subalmacen_acceso (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  subalmacen_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario (usuario_id),
  INDEX idx_subalmacen (subalmacen_id),
  UNIQUE KEY unique_acceso (usuario_id, subalmacen_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id) ON DELETE CASCADE
);

-- Tabla para contraseñas originales (solo para admin)
CREATE TABLE IF NOT EXISTS passwords_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  password_original VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_usuario (usuario_id)
);

-- Índices adicionales para optimización
CREATE INDEX IF NOT EXISTS idx_asistencias_lookup ON asistencias (programacion_fecha_id, subalmacen_id, trabajador_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_dashboard ON asistencias(subalmacen_id, programacion_fecha_id, hora_entrada, hora_salida);
CREATE INDEX IF NOT EXISTS idx_trabajadores_activos ON trabajadores(activo, subalmacen_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activos ON usuarios(activo, rol_id);

SELECT 'Base de datos inicializada correctamente' as mensaje;