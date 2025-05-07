import { Router } from 'express';
import { 
  getLowStockReport,
  getSpaceUtilisationReport,
  getSnapshots
} from '../controllers/reportsController.js';

const router = Router();

router.get('/low-stock', getLowStockReport);
router.get('/space-utilisation', getSpaceUtilisationReport);
router.get('/snapshots', getSnapshots);

export default router;