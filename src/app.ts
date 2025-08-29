import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/config';
import { logger } from './config/logger';
import { monitorRoutes } from './routes/monitor';
import { healthcheckRoutes } from './routes/healthcheck';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Trust proxy
  app.set('trust proxy', true);

  // Middleware básico
  app.use(compression());
  app.use(helmet());
  app.use(cors({
    origin: true, // Permitir todos los orígenes para devtools
    credentials: true
  }));

  // Parse JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Servir archivos estáticos para el dashboard
  app.use('/public', express.static('src/public'));

  // Rutas principales
  app.use('/api/monitor', monitorRoutes);
  app.use('/api/healthcheck', healthcheckRoutes);

  // Ruta para servir el dashboard
  app.get('/', (req: express.Request, res: express.Response) => {
    res.redirect('/public');
  });

  app.get('/dashboard', (req: express.Request, res: express.Response) => {
    res.redirect('/public');
  });

  // Health check básico
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      service: 'DevTools App'
    });
  });

  // Manejo de errores
  app.use(errorHandler);

  // 404 handler
  app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });

  return app;
}
