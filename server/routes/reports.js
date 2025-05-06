import { Router } from 'express';
import { 
  getLowStockReport,
  getSpaceUtilisationReport
} from '../controllers/reportsController.js';

const router = Router();

router.get('/low-stock', getLowStockReport);
router.get('/space-utilisation', getSpaceUtilisationReport);

export default router;