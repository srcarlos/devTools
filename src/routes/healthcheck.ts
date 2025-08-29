import { Router } from 'express';
import { healthCheckController } from '../controllers/HealthCheckController';

const router = Router();

// Rutas de health check
router.get('/health', healthCheckController.getHealth);
router.get('/ping', healthCheckController.ping);
router.get('/status', healthCheckController.getStatus);

export { router as healthcheckRoutes };
