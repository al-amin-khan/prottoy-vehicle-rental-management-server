import { Request, Response } from "express";
import { authServices } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await authServices.createUser(req.body);
        console.log(result);

        if (typeof result === "string") {
            return res.status(400).json({
                success: false,
                message: "User creation failed",
                error: result,
            });
        }

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

const signInUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await authServices.signInUser(email, password);
        
        res.status(200).json({
            success: true,
            message: "User login successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "User login failed",
            error: error.message,
        });
    }
};

export const authController = {
    createUser,
    signInUser
};