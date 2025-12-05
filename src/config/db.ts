import { Pool } from "pg";
import config from ".";


export const pool = new Pool({
    connectionString: `${config.connection_str}`,
});

const initDB = async () => {
    try {
        await pool.connect();
        console.log("Database connected");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password TEXT NOT NULL,
                phone VARCHAR(20),
                role VARCHAR(20) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(150) NOT NULL,
                type VARCHAR(50) NOT NULL,
                registration_number VARCHAR(100) NOT NULL,
                daily_rent_price DECIMAL(10, 2) NOT NULL,
                availability_status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES users(id),
                vehicle_id INTEGER REFERENCES vehicles(id),
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Database initialized");
    } catch (error) {
        console.log(error);
    }
}

export default initDB;