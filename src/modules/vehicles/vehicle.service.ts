import { pool } from "../../config/db";

const getVehicles = async () => {
    const result = await pool.query(`
        SELECT * FROM vehicles;
    `);
    if (result.rows.length === 0) {
        return [];
    }
    return result.rows;
};

const getVehicle = async (id: number) => {
    const result = await pool.query(
        `
        SELECT * FROM vehicles WHERE id = $1;
    `,
        [id]
    );
    return result.rows;
};

const createVehicle = async (payload: Record<string, unknown>) => {
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
    } = payload;
    const result = await pool.query(
        `
        INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status;
    `,
        [
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status,
        ]
    );
    return result.rows[0];
};

const updateVehicle = async (
    vehicleId: number,
    vehicle_name: string,
    type: string,
    registration_number: string,
    daily_rent_price: number,
    availability_status: string
) => {
    const checkVehicleExist = await pool.query(
        `
        SELECT * FROM vehicles WHERE id = $1;
    `,
        [vehicleId]
    );
    if (checkVehicleExist.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    const result = await pool.query(
        `
        UPDATE vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id=$6 RETURNING *;
    `,
        [
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status,
            vehicleId,
        ]
    );
    return result.rows[0];
};

const deleteVehicle = async (id: number) => {
    const result = await pool.query(
        `
        DELETE FROM vehicles WHERE id = $1;
    `,
        [id]
    );
    return result;
};

export const vehicleService = {
    getVehicle,
    getVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
};
