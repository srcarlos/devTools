import { Request, Response } from 'express';
import { monitorService, RequestLog } from '../services/MonitorService';
import { logger } from '../config/logger';

export class MonitorController {
  // Obtener todos los logs con filtros opcionales
  public getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { method, url, status, source, from, to, limit = '100' } = req.query;
      
      const filters = {
        method: method as string,
        url: url as string,
        status: status ? parseInt(status as string) : undefined,
        source: source as string,
        from: from as string,
        to: to as string
      };

      // Filtrar logs vacíos del objeto de filtros
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      let logs = monitorService.filterLogs(cleanFilters);
      
      // Aplicar límite
      const limitNum = parseInt(limit as string);
      if (limitNum > 0) {
        logs = logs.slice(0, limitNum);
      }

      res.json({
        success: true,
        data: logs,
        total: logs.length,
        filters: cleanFilters
      });
    } catch (error) {
      logger.error('Error getting logs:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving logs'
      });
    }
  };

  // Recibir logs desde el backend principal
  public receiveLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { logs } = req.body;

      if (!Array.isArray(logs)) {
        res.status(400).json({
          success: false,
          error: 'Logs must be an array'
        });
        return;
      }

      // Agregar cada log al servicio
      for (const log of logs) {
        monitorService.addLog(log);
      }

      logger.info(`Received ${logs.length} logs from backend`);

      res.json({
        success: true,
        message: `Received ${logs.length} logs`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error receiving logs:', error);
      res.status(500).json({
        success: false,
        error: 'Error processing logs'
      });
    }
  };

  // Recibir un solo log
  public receiveLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const logData = req.body as Omit<RequestLog, 'id'>;

      // Validar campos requeridos
      if (!logData.method || !logData.url || !logData.status || !logData.timestamp) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: method, url, status, timestamp'
        });
        return;
      }

      monitorService.addLog(logData);

      res.json({
        success: true,
        message: 'Log received successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error receiving log:', error);
      res.status(500).json({
        success: false,
        error: 'Error processing log'
      });
    }
  };

  // Obtener estadísticas
  public getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = monitorService.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving statistics'
      });
    }
  };

  // Limpiar logs
  public clearLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      monitorService.clearLogs();

      logger.info('Logs cleared by user');

      res.json({
        success: true,
        message: 'Logs cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error clearing logs:', error);
      res.status(500).json({
        success: false,
        error: 'Error clearing logs'
      });
    }
  };

  // Dashboard data
  public getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = monitorService.getLogs();
      const stats = monitorService.getStats();

      const dashboardData = {
        logs: logs.slice(0, 50), // Últimos 50 logs para el dashboard
        stats,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving dashboard data'
      });
    }
  };
}

export const monitorController = new MonitorController();
