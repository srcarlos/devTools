import { Router } from 'express';
import { monitorController } from '../controllers/MonitorController';

const router = Router();

// Rutas para obtener logs y estadísticas
router.get('/logs', monitorController.getLogs);
router.get('/stats', monitorController.getStats);
router.get('/dashboard', monitorController.getDashboard);

// Rutas para recibir logs del backend principal
router.post('/logs', monitorController.receiveLogs);
router.post('/log', monitorController.receiveLog);

// Ruta para limpiar logs
router.delete('/logs', monitorController.clearLogs);

export { router as monitorRoutes };
