import express from 'express';
import auth from '../../middleware/auth';
import { userControllers } from './users.controller';

const router = express.Router();

router.get("/", auth("admin"), userControllers.getUsers);
router.get("/:userId", auth("admin"), userControllers.getUser);
router.put("/:userId", auth("admin", "customer"), userControllers.UpdateUser);
router.delete("/:userId", auth("admin"), userControllers.deleteUser);


export const userRoutes = router;