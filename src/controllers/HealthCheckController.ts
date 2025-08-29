import { Request, Response } from 'express';

export class HealthCheckController {
  // Health check básico para la app devTools
  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthData = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'DevTools App',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks: {
          service: 'UP',
          storage: 'UP'
        }
      };

      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Ping endpoint simple
  public ping = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString()
    });
  };

  // Status endpoint con información detallada
  public getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const statusData = {
        service: 'DevTools App',
        status: 'running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: process.uptime(),
          readable: this.formatUptime(process.uptime())
        },
        memory: {
          usage: process.memoryUsage(),
          formatted: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
          }
        },
        platform: {
          node: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };

      res.json({
        success: true,
        data: statusData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Status check failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

export const healthCheckController = new HealthCheckController();
