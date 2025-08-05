// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Control de Asistencias API',
      version: '1.0.0',
      description: `
        API completa para el sistema de control de asistencias de Brayamsac.
        Permite gestionar usuarios, trabajadores, asistencias, almacenes y generar reportes.
        
        ## Características principales:
        - Autenticación JWT segura
        - Rate limiting y protección contra ataques
        - Validación de datos con express-validator
        - Exportación de reportes a Excel
        - Gestión de roles y permisos
        - Dashboard con métricas en tiempo real
      `,
      contact: {
        name: 'Patrick Zamata',
        email: 'patrick@brayamsac.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.brayamsac.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'correo', 'password', 'rol_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Nombre completo del usuario'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico único'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña (se encripta automáticamente)'
            },
            rol_id: {
              type: 'integer',
              description: 'ID del rol (1: Usuario, 2: Administrador, 3: Coordinador)'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado del usuario'
            },
            ya_ingreso: {
              type: 'boolean',
              default: false,
              description: 'Indica si el usuario ya ingresó al sistema'
            }
          }
        },
        Trabajador: {
          type: 'object',
          required: ['nombre', 'dni', 'subalmacen_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del trabajador'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del trabajador'
            },
            dni: {
              type: 'string',
              pattern: '^[0-9]{8}$',
              description: 'DNI de 8 dígitos'
            },
            subalmacen_id: {
              type: 'integer',
              description: 'ID del subalmacén asignado'
            },
            coordinador_id: {
              type: 'integer',
              nullable: true,
              description: 'ID del coordinador responsable'
            },
            horas_objetivo: {
              type: 'integer',
              default: 0,
              description: 'Horas objetivo mensuales'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado del trabajador'
            }
          }
        },
        Asistencia: {
          type: 'object',
          required: ['trabajador_id', 'subalmacen_id', 'registrado_por', 'programacion_fecha_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la asistencia'
            },
            trabajador_id: {
              type: 'integer',
              description: 'ID del trabajador'
            },
            subalmacen_id: {
              type: 'integer',
              description: 'ID del subalmacén'
            },
            hora_entrada: {
              type: 'string',
              format: 'time',
              example: '08:00',
              description: 'Hora de entrada (HH:MM)'
            },
            hora_salida: {
              type: 'string',
              format: 'time',
              example: '17:00',
              description: 'Hora de salida (HH:MM)'
            },
            justificacion: {
              type: 'string',
              nullable: true,
              description: 'Justificación o comentarios'
            },
            registrado_por: {
              type: 'integer',
              description: 'ID del usuario que registró la asistencia'
            },
            programacion_fecha_id: {
              type: 'integer',
              description: 'ID de la fecha programada'
            }
          }
        },
        Almacen: {
          type: 'object',
          required: ['nombre'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del almacén'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del almacén'
            },
            descripcion: {
              type: 'string',
              nullable: true,
              description: 'Descripción del almacén'
            },
            ubicacion: {
              type: 'string',
              nullable: true,
              description: 'Ubicación física'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado del almacén'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            detalle: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['correo', 'contraseña'],
          properties: {
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            contraseña: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            },
            usuario: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
                correo: { type: 'string' },
                rol: { type: 'integer' },
                nombre_rol: { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
