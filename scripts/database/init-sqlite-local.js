import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: '.env' });

async function initializeSQLiteDatabase() {
  console.log('🚀 INICIALIZANDO BASE DE DATOS SQLITE LOCAL');
  console.log('==========================================\n');
  
  let db;
  
  try {
    // Crear/abrir base de datos SQLite
    const dbPath = path.join(process.cwd(), 'database', 'asistencia_local.db');
    
    // Crear directorio si no existe
    const fs = await import('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('✅ Base de datos SQLite creada en:', dbPath);
    
    // Habilitar foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Crear tablas
    console.log('\n📋 Creando estructura de tablas...');
    
    // Tabla de roles
    await db.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar roles básicos
    await db.exec(`
      INSERT OR IGNORE INTO roles (id, nombre, descripcion) VALUES 
      (1, 'USUARIO', 'Usuario básico del sistema'),
      (2, 'ADMINISTRADOR', 'Administrador con acceso total'),
      (3, 'COORDINADOR', 'Coordinador con acceso limitado por subalmacén')
    `);
    
    // Tabla de almacenes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS almacenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar almacenes de ejemplo
    await db.exec(`
      INSERT OR IGNORE INTO almacenes (nombre, descripcion) VALUES 
      ('Almacén Central', 'Almacén principal de la empresa'),
      ('Almacén Norte', 'Almacén ubicado en la zona norte'),
      ('Almacén Sur', 'Almacén ubicado en la zona sur')
    `);
    
    // Tabla de subalmacenes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS subalmacenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        almacen_id INTEGER NOT NULL,
        descripcion TEXT,
        refrigerio TIME,
        jornada VARCHAR(50),
        activo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (almacen_id) REFERENCES almacenes(id) ON DELETE CASCADE
      )
    `);
    
    // Insertar subalmacenes de ejemplo
    await db.exec(`
      INSERT OR IGNORE INTO subalmacenes (nombre, almacen_id, descripcion) VALUES 
      ('Subalmacén A1', 1, 'Primer subalmacén del almacén central'),
      ('Subalmacén A2', 1, 'Segundo subalmacén del almacén central'),
      ('Subalmacén B1', 2, 'Primer subalmacén del almacén norte'),
      ('Subalmacén C1', 3, 'Primer subalmacén del almacén sur')
    `);
    
    // Tabla de usuarios
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol_id INTEGER NOT NULL,
        activo BOOLEAN DEFAULT 1,
        ya_ingreso BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rol_id) REFERENCES roles(id)
      )
    `);
    
    // Tabla de trabajadores
    await db.exec(`
      CREATE TABLE IF NOT EXISTS trabajadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        dni VARCHAR(8) UNIQUE NOT NULL,
        subalmacen_id INTEGER NOT NULL,
        coordinador_id INTEGER,
        horas_objetivo INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id),
        FOREIGN KEY (coordinador_id) REFERENCES usuarios(id)
      )
    `);
    
    // Tabla de programación de fechas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS programacion_fechas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        subalmacen_id INTEGER NOT NULL,
        activo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, subalmacen_id),
        FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id) ON DELETE CASCADE
      )
    `);
    
    // Tabla de asistencias
    await db.exec(`
      CREATE TABLE IF NOT EXISTS asistencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trabajador_id INTEGER NOT NULL,
        subalmacen_id INTEGER NOT NULL,
        hora_entrada TIME,
        hora_salida TIME,
        justificacion TEXT,
        registrado_por INTEGER NOT NULL,
        programacion_fecha_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trabajador_id, programacion_fecha_id),
        FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
        FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id),
        FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
        FOREIGN KEY (programacion_fecha_id) REFERENCES programacion_fechas(id) ON DELETE CASCADE
      )
    `);
    
    // Tabla de permisos de acceso
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuario_subalmacen_acceso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        subalmacen_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, subalmacen_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (subalmacen_id) REFERENCES subalmacenes(id) ON DELETE CASCADE
      )
    `);
    
    // Tabla para contraseñas originales
    await db.exec(`
      CREATE TABLE IF NOT EXISTS passwords_admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        password_original VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Estructura de tablas creada');
    
    // Crear usuarios de prueba
    const usuarios = [
      {
        nombre: 'Administrador Sistema',
        correo: 'admin@brayamsac.com',
        password: '123456',
        rol_id: 2
      },
      {
        nombre: 'Coordinador Test',
        correo: 'coordinador@brayamsac.com',
        password: '123456',
        rol_id: 3
      },
      {
        nombre: 'Usuario Test',
        correo: 'usuario@brayamsac.com',
        password: '123456',
        rol_id: 1
      }
    ];
    
    console.log('\n👥 Creando usuarios de prueba...');
    
    for (const usuario of usuarios) {
      const hashedPassword = await bcrypt.hash(usuario.password, 12);
      
      try {
        const result = await db.run(
          'INSERT OR IGNORE INTO usuarios (nombre, correo, password, rol_id, activo) VALUES (?, ?, ?, ?, 1)',
          [usuario.nombre, usuario.correo, hashedPassword, usuario.rol_id]
        );
        
        if (result.changes > 0) {
          // Guardar contraseña original para admin
          await db.run(
            'INSERT OR IGNORE INTO passwords_admin (usuario_id, password_original) VALUES (?, ?)',
            [result.lastID, usuario.password]
          );
          
          console.log(`✅ Usuario creado: ${usuario.correo} (${usuario.password})`);
        } else {
          console.log(`⚠️ Usuario ya existe: ${usuario.correo}`);
        }
      } catch (err) {
        console.log(`❌ Error creando usuario ${usuario.correo}:`, err.message);
      }
    }
    
    // Crear trabajadores de ejemplo
    console.log('\n👷 Creando trabajadores de ejemplo...');
    
    const trabajadores = [
      { nombre: 'Juan Pérez', dni: '12345678', subalmacen_id: 1 },
      { nombre: 'María García', dni: '87654321', subalmacen_id: 1 },
      { nombre: 'Carlos López', dni: '11223344', subalmacen_id: 2 },
      { nombre: 'Ana Martínez', dni: '44332211', subalmacen_id: 2 },
      { nombre: 'Luis Rodríguez', dni: '55667788', subalmacen_id: 3 },
      { nombre: 'Carmen Sánchez', dni: '88776655', subalmacen_id: 4 }
    ];
    
    for (const trabajador of trabajadores) {
      try {
        const result = await db.run(
          'INSERT OR IGNORE INTO trabajadores (nombre, dni, subalmacen_id, activo) VALUES (?, ?, ?, 1)',
          [trabajador.nombre, trabajador.dni, trabajador.subalmacen_id]
        );
        
        if (result.changes > 0) {
          console.log(`✅ Trabajador creado: ${trabajador.nombre} (${trabajador.dni})`);
        } else {
          console.log(`⚠️ Trabajador ya existe: ${trabajador.dni}`);
        }
      } catch (err) {
        console.log(`❌ Error creando trabajador ${trabajador.dni}:`, err.message);
      }
    }
    
    // Asignar acceso de coordinador
    console.log('\n🔑 Asignando permisos de acceso...');
    
    try {
      const coordinador = await db.get(
        'SELECT id FROM usuarios WHERE correo = ?',
        ['coordinador@brayamsac.com']
      );
      
      if (coordinador) {
        const accesos = [1, 2]; // Subalmacenes 1 y 2
        
        for (const subalmacenId of accesos) {
          const result = await db.run(
            'INSERT OR IGNORE INTO usuario_subalmacen_acceso (usuario_id, subalmacen_id) VALUES (?, ?)',
            [coordinador.id, subalmacenId]
          );
          
          if (result.changes > 0) {
            console.log(`✅ Acceso asignado: Coordinador -> Subalmacén ${subalmacenId}`);
          } else {
            console.log(`⚠️ Acceso ya existe: Coordinador -> Subalmacén ${subalmacenId}`);
          }
        }
      }
    } catch (err) {
      console.log('⚠️ Error asignando permisos:', err.message);
    }
    
    console.log('\n🎉 BASE DE DATOS SQLITE LOCAL INICIALIZADA CORRECTAMENTE!');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('================================');
    console.log('👤 Administrador:');
    console.log('   Email: admin@brayamsac.com');
    console.log('   Password: 123456');
    console.log('\n👤 Coordinador:');
    console.log('   Email: coordinador@brayamsac.com');
    console.log('   Password: 123456');
    console.log('\n👤 Usuario:');
    console.log('   Email: usuario@brayamsac.com');
    console.log('   Password: 123456');
    console.log('\n🔧 CONFIGURACIÓN:');
    console.log('================================');
    console.log('Base de datos: SQLite');
    console.log('Archivo:', dbPath);
    console.log('\n⚠️ IMPORTANTE: Para usar SQLite, instala la dependencia:');
    console.log('npm install sqlite3 sqlite');
    console.log('\nY actualiza tu configuración de base de datos en el código.');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos SQLite:', error.message);
    console.error('\n💡 Asegúrate de que:');
    console.error('1. Tienes permisos de escritura en el directorio');
    console.error('2. SQLite3 está instalado: npm install sqlite3 sqlite');
  } finally {
    if (db) {
      await db.close();
    }
  }
}

initializeSQLiteDatabase();