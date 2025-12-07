import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

const getVehicles = async (req: Request, res: Response) => {
    try {
        const result = await vehicleService.getVehicles();

        if (result.length === 0) {
            return res.status(400).json({
                success: true,
                message: "No vehicles found",
                data: result,
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicles fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch vehicles",
            data: error.message,
        });
    }
};
const getVehicle = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    try {
        const result = await vehicleService.getVehicle(Number(vehicleId));

        if (result.length === 0) {
            return res.status(400).json({
                success: true,
                message: "No vehicles found",
                data: result,
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicles fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch vehicles",
            data: error.message,
        });
    }
};

const createVehicle = async (req: Request, res: Response) => {
    const { type } = req.body;

    try {
        if (
            type !== "car" &&
            type !== "van" &&
            type !== "SUV" &&
            type !== "bike"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle type",
            });
        }
        const result = await vehicleService.createVehicle(req.body);
        res.status(200).json({
            success: true,
            message: "Vehicle created successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to create vehicle",
            data: error.message,
        });
    }
};

const updateVehicle = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    } = req.body;
    try {
        const result = await vehicleService.updateVehicle(
            Number(vehicleId),
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status
        );
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to update vehicle",
            data: error.message,
        });
    }
};

const deleteVehicle = async (req: Request, res: Response) => {
    const { vehicleId } = req.params;
    try {
        const result = await vehicleService.deleteVehicle(Number(vehicleId));
        if (result.rowCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Vehicle not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: "Failed to delete vehicle",
            data: error.message,
        });
    }
};

export const vehicleControllers = {
    getVehicle,
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};
