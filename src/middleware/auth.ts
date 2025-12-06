import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

// roles for ["admin", "customer"]
const  auth = (...roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers)
        try {
            const token = req.headers.authorization?.split(" ")[1];
            
            if (!token) {
                return res.status(401).json({ message: "Unauthorized access!" });
            }
            const decoded = jwt.verify(
                token,
                config.jwtSecret as string
            ) as JwtPayload;
            req.user = decoded;

            //admin checking
            if (roles.length && !roles.includes(decoded.role as string)) {
                return res.status(500).json({
                    error: "unauthorized access!",
                });
            }

            next();
        } catch (err: any) {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    };
};

export default auth;
