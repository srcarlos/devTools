import { v4 as uuidv4 } from 'uuid';

// Definición del tipo para el log de solicitud
export interface RequestLog {
  id: string;
  method: string;
  url: string;
  status: number;
  responseTime: number;
  timestamp: string;
  ip: string;
  userAgent?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  source?: string; // Para identificar de qué backend viene
}

// Servicio para monitorear las solicitudes
class MonitorService {
  private logs: RequestLog[] = [];
  private maxLogs: number = 1000;
  
  constructor() {
    // Agregar algunos logs de ejemplo para mostrar al inicio
    this.addSampleLogs();
  }
  
  // Agrega logs de ejemplo para mostrar inicialmente
  private addSampleLogs(): void {
    const sampleLogs: RequestLog[] = [
      {
        id: uuidv4(),
        method: 'GET',
        url: '/api/public/quotation',
        status: 200,
        responseTime: 120,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Example)',
        source: 'main-backend',
        requestHeaders: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        requestBody: null,
        responseHeaders: {
          'content-type': 'application/json',
          'x-powered-by': 'Express'
        },
        responseBody: { 
          success: true, 
          data: { 
            plans: [
              { id: 1, name: "Plan Básico", price: 5000 },
              { id: 2, name: "Plan Premium", price: 8000 }
            ]
          } 
        }
      }
    ];
    
    for (const log of sampleLogs) {
      this.logs.unshift(log);
    }
  }

  // Método para registrar una nueva solicitud (viene del backend principal)
  public addLog(log: Omit<RequestLog, 'id'>): void {
    const logWithId: RequestLog = {
      ...log,
      id: uuidv4()
    };
    
    this.logs.unshift(logWithId);
    
    // Mantener solo la cantidad máxima de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  // Obtener todos los logs
  public getLogs(): RequestLog[] {
    return this.logs;
  }

  // Limpiar todos los logs
  public clearLogs(): void {
    this.logs = [];
    this.addSampleLogs(); // Mantener logs de ejemplo
  }

  // Filtrar logs por método, url o estado
  public filterLogs(query: { 
    method?: string; 
    url?: string; 
    status?: number;
    source?: string;
    from?: string;
    to?: string;
  }): RequestLog[] {
    return this.logs.filter(log => {
      let matches = true;
      
      if (query.method && log.method !== query.method) {
        matches = false;
      }
      
      if (query.url && !log.url.includes(query.url)) {
        matches = false;
      }
      
      if (query.status && log.status !== query.status) {
        matches = false;
      }

      if (query.source && log.source !== query.source) {
        matches = false;
      }

      if (query.from) {
        const logTime = new Date(log.timestamp);
        const fromTime = new Date(query.from);
        if (logTime < fromTime) {
          matches = false;
        }
      }

      if (query.to) {
        const logTime = new Date(log.timestamp);
        const toTime = new Date(query.to);
        if (logTime > toTime) {
          matches = false;
        }
      }
      
      return matches;
    });
  }

  // Estadísticas de logs
  public getStats(): {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
    avgResponseTime: number;
    recentErrors: RequestLog[];
  } {
    const stats = {
      total: this.logs.length,
      byMethod: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      avgResponseTime: 0,
      recentErrors: [] as RequestLog[]
    };

    let totalResponseTime = 0;

    for (const log of this.logs) {
      // Contar por método
      stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
      
      // Contar por status
      const statusRange = `${Math.floor(log.status / 100)}xx`;
      stats.byStatus[statusRange] = (stats.byStatus[statusRange] || 0) + 1;
      
      // Sumar tiempo de respuesta
      totalResponseTime += log.responseTime;
      
      // Errores recientes (últimas 24 horas)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (log.status >= 400 && new Date(log.timestamp) > oneDayAgo) {
        stats.recentErrors.push(log);
      }
    }

    stats.avgResponseTime = this.logs.length > 0 ? totalResponseTime / this.logs.length : 0;
    stats.recentErrors = stats.recentErrors.slice(0, 10); // Solo los últimos 10 errores

    return stats;
  }
}

// Exportar una instancia única del servicio (patrón Singleton)
export const monitorService = new MonitorService();
