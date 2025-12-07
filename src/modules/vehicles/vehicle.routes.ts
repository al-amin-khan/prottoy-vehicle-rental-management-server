import express from 'express';
import { vehicleControllers } from './vehicle.controller';
import auth from '../../middleware/auth';


const router = express.Router();

router.get('/', vehicleControllers.getVehicles);
router.get('/:vehicleId', vehicleControllers.getVehicle);
router.post('/', auth("admin"), vehicleControllers.createVehicle);
router.put('/:vehicleId', auth("admin"), vehicleControllers.updateVehicle);
router.delete('/:vehicleId', auth("admin"), vehicleControllers.deleteVehicle);


export const vehicleRoutes = router;