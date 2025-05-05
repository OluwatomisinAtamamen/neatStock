import { Router } from 'express';
import { 
  searchItems,
  getCategories,
  getLocations
} from '../controllers/searchController.js';

const router = Router();

// Search endpoints
router.get('/items', searchItems);
router.get('/categories', getCategories);
router.get('/locations', getLocations);

export default router;