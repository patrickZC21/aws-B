import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: '.env' });

async function initializeLocalDatabase() {
  console.log('🚀 INICIALIZANDO BASE DE DATOS LOCAL');
  console.log('=====================================\n');
  
  let connection;
  
  try {
    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Cambiar si tu MySQL tiene contraseña
    });
    
    console.log('✅ Conectado a MySQL local');
    
    // Leer y ejecutar el script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'init-local-db.sql'), 'utf8');
    const statements = sqlScript.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Estructura de base de datos creada');
    
    // Cambiar a la base de datos creada
    await connection.execute('USE asistencia_db');
    
    // Crear usuarios de prueba con contraseñas encriptadas
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
        const [result] = await connection.execute(
          'INSERT INTO usuarios (nombre, correo, password, rol_id, activo) VALUES (?, ?, ?, ?, 1)',
          [usuario.nombre, usuario.correo, hashedPassword, usuario.rol_id]
        );
        
        // Guardar contraseña original para admin
        await connection.execute(
          'INSERT INTO passwords_admin (usuario_id, password_original) VALUES (?, ?)',
          [result.insertId, usuario.password]
        );
        
        console.log(`✅ Usuario creado: ${usuario.correo} (${usuario.password})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Usuario ya existe: ${usuario.correo}`);
        } else {
          throw err;
        }
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
        await connection.execute(
          'INSERT INTO trabajadores (nombre, dni, subalmacen_id, activo) VALUES (?, ?, ?, 1)',
          [trabajador.nombre, trabajador.dni, trabajador.subalmacen_id]
        );
        console.log(`✅ Trabajador creado: ${trabajador.nombre} (${trabajador.dni})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Trabajador ya existe: ${trabajador.dni}`);
        } else {
          throw err;
        }
      }
    }
    
    // Asignar acceso de coordinador a subalmacenes
    console.log('\n🔑 Asignando permisos de acceso...');
    
    try {
      // El coordinador tendrá acceso a los subalmacenes 1 y 2
      const [coordinadorResult] = await connection.execute(
        'SELECT id FROM usuarios WHERE correo = ?',
        ['coordinador@brayamsac.com']
      );
      
      if (coordinadorResult.length > 0) {
        const coordinadorId = coordinadorResult[0].id;
        
        const accesos = [1, 2]; // Subalmacenes 1 y 2
        
        for (const subalmacenId of accesos) {
          try {
            await connection.execute(
              'INSERT INTO usuario_subalmacen_acceso (usuario_id, subalmacen_id) VALUES (?, ?)',
              [coordinadorId, subalmacenId]
            );
            console.log(`✅ Acceso asignado: Coordinador -> Subalmacén ${subalmacenId}`);
          } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              console.log(`⚠️ Acceso ya existe: Coordinador -> Subalmacén ${subalmacenId}`);
            } else {
              throw err;
            }
          }
        }
      }
    } catch (err) {
      console.log('⚠️ Error asignando permisos:', err.message);
    }
    
    console.log('\n🎉 BASE DE DATOS LOCAL INICIALIZADA CORRECTAMENTE!');
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
    console.log('Base de datos: asistencia_db');
    console.log('Host: localhost');
    console.log('Puerto: 3306');
    console.log('\n⚠️ IMPORTANTE: Actualiza tu archivo .env con:');
    console.log('DB_HOST=localhost');
    console.log('DB_PORT=3306');
    console.log('DB_USER=root');
    console.log('DB_PASSWORD=');
    console.log('DB_NAME=asistencia_db');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    console.error('\n💡 Asegúrate de que:');
    console.error('1. MySQL esté instalado y ejecutándose');
    console.error('2. El usuario root tenga permisos para crear bases de datos');
    console.error('3. El puerto 3306 esté disponible');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeLocalDatabase();