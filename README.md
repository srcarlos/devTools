# DevTools Application

Esta es la aplicación independiente de DevTools para monitoreo y debugging del sistema de adquisición digital BTP.

## Características

- **Monitor de Requests**: Visualización en tiempo real de todas las peticiones HTTP
- **Dashboard Interactivo**: Interfaz web para monitoreo
- **Estadísticas**: Métricas de rendimiento y errores
- **Health Checks**: Verificación de estado del sistema
- **API REST**: Endpoints para recibir logs del backend principal

## Instalación

```bash
cd devtools-app
npm install
```

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Con watch (reinicio automático)
npm run dev:watch
```

## Producción

```bash
# Compilar
npm run build

# Ejecutar
npm start
```

## Variables de Entorno

- `PORT`: Puerto del servidor (default: 3001)
- `NODE_ENV`: Entorno de ejecución
- `DEVTOOLS_URL`: URL de esta aplicación
- `BACKEND_URL`: URL del backend principal
- `BACKEND_API_KEY`: Clave API para autenticación
- `LOG_LEVEL`: Nivel de logging
- `MAX_LOGS`: Máximo número de logs en memoria
- `ENABLE_DEVTOOLS_LOGGING`: Habilitar logging desde backend

## API Endpoints

### Monitor
- `GET /api/monitor/logs` - Obtener logs con filtros
- `POST /api/monitor/logs` - Recibir batch de logs
- `POST /api/monitor/log` - Recibir log individual
- `GET /api/monitor/stats` - Obtener estadísticas
- `GET /api/monitor/dashboard` - Datos del dashboard
- `DELETE /api/monitor/logs` - Limpiar logs

### Health Check
- `GET /api/healthcheck/health` - Estado de la aplicación
- `GET /api/healthcheck/ping` - Ping simple
- `GET /api/healthcheck/status` - Estado detallado

### Dashboard
- `GET /` - Redirige al dashboard
- `GET /public` - Dashboard web
- `GET /health` - Health check básico

## Integración con Backend Principal

El backend principal envía automáticamente los logs de requests a esta aplicación mediante:

1. **DevToolsLoggerService**: Servicio que actúa como cliente HTTP
2. **Batching**: Los logs se envían en lotes cada 5 segundos
3. **Queue Management**: Cola con gestión de errores y reintento
4. **Health Monitoring**: Verificación de conectividad

## Configuración del Backend Principal

Agregar las siguientes variables de entorno al backend principal:

```
DEVTOOLS_URL=http://localhost:3001
DEVTOOLS_API_KEY=devtools-secret-key
ENABLE_DEVTOOLS_LOGGING=true
```

## Despliegue

### Cloud Foundry

```bash
cf push -f manifest.yml
```

### Docker

```bash
# Build
docker build -t devtools-app .

# Run
docker run -p 3001:3001 devtools-app
```

## Estructura del Proyecto

```
src/
├── app.ts              # Configuración Express
├── server.ts           # Punto de entrada
├── config/             # Configuraciones
│   ├── config.ts
│   └── logger.ts
├── controllers/        # Controladores
│   ├── MonitorController.ts
│   └── HealthCheckController.ts
├── services/          # Servicios
│   └── MonitorService.ts
├── routes/            # Rutas
│   ├── monitor.ts
│   └── healthcheck.ts
├── middleware/        # Middlewares
│   └── errorHandler.ts
└── public/           # Assets estáticos
    ├── index.html
    ├── dashboard.js
    └── styles.css
```
