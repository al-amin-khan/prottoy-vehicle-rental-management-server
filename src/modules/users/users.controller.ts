import { Request, Response } from "express";
import { userServices } from "./users.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userServices.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User creation failed",
            error: error.message,
        });
    }
};


export const userController = {
    createUser,
};
