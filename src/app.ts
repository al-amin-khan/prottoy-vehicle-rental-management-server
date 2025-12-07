import express, { Request, Response } from "express";
import initDB from "./config/db";
import { userRoutes } from "./modules/users/users.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicle.routes";

const app = express();
app.use(express.json());

// initializing DB
initDB();

app.get("/", (req: Request, res: Response): void => {
    res.status(200).json({
        success: true,
        message: "Prottoy Vehicle Rental Management Server is running",
    });
});

app.use("/api/v1/auth/",  authRoutes);
app.use("/api/v1/users/",  userRoutes);
app.use("/api/v1/vehicles/",  vehicleRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
    });
});

export default app;
