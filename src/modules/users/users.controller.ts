import { Request, Response } from "express";
import { userServices } from "./users.service";

const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getUsers();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User fetch failed",
            error: error.message,
        });
    }
};

const getUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const result = await userServices.getUser(Number(userId));
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User fetch failed",
            error: error.message,
        });
    }
};


const UpdateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, email, password, phone, role } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User id is required",
        });
    }

    try {
        const result = await userServices.updateUser(name, email, phone, role, Number(userId));
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User update failed",
            error: error.message,
        });
    }
};


const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const result = await userServices.deleteUser(Number(userId));
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User delete failed",
            error: error.message,
        });
    }
}


export const userControllers = {
    getUsers,
    UpdateUser,
    getUser,
    deleteUser
}
