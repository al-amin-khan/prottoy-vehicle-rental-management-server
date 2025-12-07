import express from 'express';
import auth from '../../middleware/auth';
import { bookingControllers } from './bookings.controllers';

const router = express.Router();

router.get('/', auth("admin", "customer"),  bookingControllers.getBookings); 
router.post('/', auth("admin"),  bookingControllers.createBooking);
router.put('/:bookingId', auth("admin", "customer"),  bookingControllers.updateBooking);
router.delete('/:bookingId', auth("admin"),  bookingControllers.deleteBooking);


export const bookingRoutes = router;