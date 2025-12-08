import { Request, Response } from "express";
import { bookingServices } from "./bookings.services";

const getBookings = async (req: Request, res: Response) => {
    const { user } = req;
    const role = user?.role;
    const isAdmin = user?.role === "admin";
    const isCustomer = user?.role === "customer";

    try {
        const result = await bookingServices.getBookings(role);
        if (isAdmin) {
            if (result?.length === 0) {
                return res.status(400).json({
                    success: true,
                    message: "No bookings found",
                    data: [],
                });
            }
            res.status(200).json({
                success: true,
                message: "Bookings fetched successfully",
                data: result,
            });
        }
        if (isCustomer) {
            const filteredByEmail = result?.filter(
                (res) => res.customer_id === user?.id
            );
            if (filteredByEmail?.length === 0) {
                return res.status(400).json({
                    success: true,
                    message: "No bookings found",
                    data: [],
                });
            }
            res.status(200).json({
                success: true,
                message: "Bookings fetched successfully",
                data: filteredByEmail,
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Booking fetch failed",
            error: error.message,
        });
    }
};

const createBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.createBooking(req.body);
        res.status(200).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Booking creation failed",
            error: error.message,
        });
    }
};

const updateBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    const role = req?.user?.role;

    try {
        if (role === "admin") {
            const result = await bookingServices.updateBooking(
                Number(bookingId),
                status,
                role
            );
            res.status(200).json({
                success: true,
                message: "Booking updated successfully",
                data: result,
            });
        } else if (role === "customer") {
            if (status === "cancelled") {
                const result = await bookingServices.updateBooking(
                    Number(bookingId),
                    status
                );
                res.status(200).json({
                    success: true,
                    message: "Booking updated successfully",
                    data: result,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Only cancelled is allowed for customer",
                    data: [],
                });
            }
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Booking update failed",
            error: error.message,
        });
    }
};

const deleteBooking = async (req: Request, res: Response) => {};

export const bookingControllers = {
    getBookings,
    createBooking,
    updateBooking,
    deleteBooking,
};
