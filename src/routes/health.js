import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint for AWS Load Balancer
 *     description: Verifica el estado del servidor y la conexión a la base de datos
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio saludable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 database:
 *                   type: string
 *                   example: connected
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *       503:
 *         description: Servicio no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar conexión a la base de datos
    const [dbResult] = await pool.execute('SELECT 1 as test, NOW() as db_time');
    
    const responseTime = Date.now() - startTime;
    
    // Respuesta exitosa
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        serverTime: dbResult[0].db_time
      },
      server: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        pid: process.pid
      },
      aws: {
        region: process.env.AWS_REGION || 'not-set',
        instanceId: process.env.AWS_INSTANCE_ID || 'local'
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    
    // Respuesta de error
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'disconnected',
        error: error.message
      },
      server: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        pid: process.pid
      }
    });
  }
});

/**
 * @swagger
 * /health/simple:
 *   get:
 *     summary: Simple health check (solo status)
 *     description: Health check simplificado para balanceadores de carga básicos
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 *       503:
 *         description: Service Unavailable
 */
router.get('/health/simple', async (req, res) => {
  try {
    // Test rápido de DB
    await pool.execute('SELECT 1');
    res.status(200).send('OK');
  } catch (error) {
    res.status(503).send('FAIL');
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Verifica si la aplicación está lista para recibir tráfico
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Ready
 *       503:
 *         description: Not Ready
 */
router.get('/health/ready', async (req, res) => {
  try {
    // Verificar que todos los servicios críticos estén disponibles
    await pool.execute('SELECT 1');
    
    // Verificar variables de entorno críticas
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'not-ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Verifica si la aplicación está viva (para Kubernetes/ECS)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Alive
 */
router.get('/health/live', (req, res) => {
  // Simple liveness check - si el proceso responde, está vivo
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

export default router;