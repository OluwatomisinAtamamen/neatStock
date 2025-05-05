import { Router } from 'express';
import { 
  addItem,
  updateItem,
  deleteItem,
  saveStocktake
} from '../controllers/inventoryController.js';

const router = Router();

router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);
router.post('/stocktake', saveStocktake);

export default router;