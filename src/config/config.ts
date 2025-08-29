export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración para recibir logs del backend principal
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:3000',
    apiKey: process.env.BACKEND_API_KEY || 'devtools-secret-key'
  },
  
  // Configuración de logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    maxLogs: parseInt(process.env.MAX_LOGS || '1000'),
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '7')
  },
  
  // Configuración de almacenamiento
  storage: {
    type: process.env.STORAGE_TYPE || 'memory', // memory, file, database
    filePath: process.env.STORAGE_FILE_PATH || './data/logs.json'
  }
};
