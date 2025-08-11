// PM2 Configuration for AWS EC2 Deployment
// Configuración optimizada para producción en AWS

module.exports = {
  apps: [{
    // Configuración básica de la aplicación
    name: 'brayamsac-backend',
    script: 'src/index.js',
    
    // Configuración de instancias
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: 'cluster',
    
    // Variables de entorno
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 80,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT || 3306,
      DB_SSL: 'true',
      JWT_SECRET: process.env.JWT_SECRET,
      FRONTEND_URL: process.env.FRONTEND_URL,
      AWS_REGION: process.env.AWS_REGION || 'sa-east-1'
    },
    
    // Configuración de logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de reinicio automático
    autorestart: true,
    watch: false, // Deshabilitado en producción
    max_memory_restart: '1G',
    
    // Configuración de reinicio en caso de error
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Health check configuration
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Configuración específica para AWS
    node_args: '--max-old-space-size=1024',
    
    // Configuración de merge logs
    merge_logs: true,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout
    listen_timeout: 8000,
    
    // Configuración de source map
    source_map_support: true,
    
    // Configuración de interpretador
    interpreter: 'node',
    interpreter_args: '--harmony',
    
    // Configuración de tiempo de espera
    wait_ready: true,
    
    // Configuración de shutdown
    shutdown_with_message: true,
    
    // Configuración específica para cluster mode
    instance_var: 'INSTANCE_ID',
    
    // Configuración de cron para restart programado (opcional)
    // cron_restart: '0 2 * * *', // Restart diario a las 2 AM
    
    // Configuración de ignore watch
    ignore_watch: [
      'node_modules',
      'logs',
      '.git',
      '*.log',
      'database'
    ],
    
    // Configuración de watch options (solo para desarrollo)
    watch_options: {
      followSymlinks: false,
      usePolling: false
    },
    
    // Configuración de tiempo de espera para graceful shutdown
    time: true,
    
    // Configuración de logs de PM2
    pmx: true,
    
    // Configuración de automation
    automation: false,
    
    // Configuración de treekill
    treekill: true,
    
    // Configuración específica para AWS EC2
    env_aws: {
      NODE_ENV: 'production',
      PORT: 80,
      INSTANCE_TYPE: 'aws-ec2',
      LOG_LEVEL: 'info',
      DISABLE_LOGIN_LOGS: 'true',
      MYSQL_CONNECTION_LIMIT: '10'
    }
  }],
  
  // Configuración de deployment (opcional)
  deploy: {
    production: {
      user: 'ec2-user',
      host: ['your-ec2-instance-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/brayamsac-backend.git',
      path: '/home/ec2-user/brayamsac-backend',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo yum update -y && sudo yum install -y nodejs npm git',
      'post-setup': 'npm install && pm2 start ecosystem.config.js --env production'
    }
  }
};