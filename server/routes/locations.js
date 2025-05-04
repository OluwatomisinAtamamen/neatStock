import { Router } from 'express';
import { 
  getLocations, 
  getLocationById, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  uploadLocationImage
} from '../controllers/locationController.js';
import { upload } from '../middleware/fileUpload.js';

const router = Router();

router.get('/', getLocations);
router.get('/:locationId', getLocationById);
router.post('/', createLocation);
router.put('/:locationId', updateLocation);
router.delete('/:locationId', deleteLocation);
router.post('/upload-image', upload.single('image'), uploadLocationImage);

export default router;