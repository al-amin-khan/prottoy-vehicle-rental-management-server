import { pool } from "../../config/db";
import { differenceInDays } from "date-fns";

const getBookings = async (role: string) => {
    if (role === "admin") {
        const result = await pool.query(
            `
            SELECT
                b.id,
                b.customer_id,
                b.vehicle_id,
                b.rent_start_date,
                b.rent_end_date,
                b.total_price,
                b.status,
                json_build_object(
                    'name',  c.name,
                    'email', c.email
                ) AS customer,
                json_build_object(
                    'vehicle_name',        v.vehicle_name,
                    'registration_number', v.registration_number
                ) AS vehicle
            FROM bookings b
            JOIN users    c ON b.customer_id = c.id
            JOIN vehicles v ON b.vehicle_id   = v.id;
        `
        );
        return result.rows;
    } else if (role === "customer") {
        const result = await pool.query(
            `
            SELECT
                b.id,
                b.customer_id,
                b.vehicle_id,
                b.rent_start_date,
                b.rent_end_date,
                b.total_price,
                b.status,
                json_build_object(
                    'vehicle_name',        v.vehicle_name,
                    'registration_number', v.registration_number,
                    'type', v.type
                ) AS vehicle
            FROM bookings b
            JOIN users    c ON b.customer_id = c.id
            JOIN vehicles v ON b.vehicle_id   = v.id;
        `
        );
        return result.rows;
    }
};

const createBooking = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    const isVehicleExists = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1;`,
        [vehicle_id]
    );

    if (isVehicleExists.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    const getVehicleRentPrice = await pool.query(
        `SELECT daily_rent_price FROM vehicles WHERE id = $1;`,
        [vehicle_id]
    );

    const vehicleRentPrice = getVehicleRentPrice.rows[0].daily_rent_price;
    const totalDays: number = differenceInDays(
        new Date(rent_end_date as Date),
        new Date(rent_start_date as Date)
    );
    const totalPrice: number = vehicleRentPrice * totalDays;

    const result = await pool.query(
        `
        INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
        VALUES ($1, $2, $3, $4, $5, 'active')
        returning 
            id, 
            customer_id, 
            vehicle_id, 
            rent_start_date, 
            rent_end_date, 
            total_price, 
            status,
            (
            SELECT json_build_object(
                'vehicle_name', v.vehicle_name, 
                'daily_rent_price', v.daily_rent_price
            )
            FROM vehicles v 
            WHERE v.id = $2
            ) AS vehicle;
        `,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );

    await pool.query(
        `
        UPDATE vehicles
        SET availability_status = 'booked'
        WHERE id = $1;
        `,
        [vehicle_id]
    );

    return result.rows[0];
};

const updateBooking = async (
    bookingId: number,
    status: string,
    role: string
) => {
    if (role === "admin") {
        if (status === "returned") {
            const result = await pool.query(
                `
                UPDATE bookings b
                SET status = $1 
                WHERE b.id = $2 
                RETURNING 
                    b.id, 
                    b.customer_id, 
                    b.vehicle_id, 
                    b.rent_start_date, 
                    b.rent_end_date, 
                    b.total_price, 
                    b.status,
                    (
                    SELECT json_build_object(
                        'availability_status', 'available'
                    )
                    FROM vehicles v 
                    WHERE v.id = b.vehicle_id
                    ) AS vehicle;
                `,
                [status, bookingId]
            );
            await pool.query(
                `
                UPDATE vehicles
                SET availability_status = 'available'
                WHERE id = $1;
                `,
                [result.rows[0].vehicle_id]
            );
            return result.rows[0];
        }
    }

    const result = await pool.query(
        `UPDATE bookings 
        SET status = $1 
        WHERE id = $2 
        RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status;`,
        [status, bookingId]
    );
    await pool.query(
        `
        UPDATE vehicles
        SET availability_status = 'available'
        WHERE id = $1;
        `,
        [result.rows[0].vehicle_id]
    );
    return result.rows[0];
};

// const deleteBooking = async (bookingId) => {};

export const bookingServices = {
    // getBooking,
    getBookings,
    createBooking,
    updateBooking,
    // deleteBooking
};
