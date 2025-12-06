import { Pool } from "pg";
import config from ".";


export const pool = new Pool({
    connectionString: `${config.connection_str}`,
});

const initDB = async () => {
    const client = await pool.connect();
    
    try {
        console.log("Database connected");
        
        await client.query("SET TIME ZONE 'Asia/Dhaka'");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                phone VARCHAR(20),
                role VARCHAR(20) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                vehicle_name VARCHAR(150) NOT NULL,
                type VARCHAR(50) NOT NULL,
                registration_number VARCHAR(100) NOT NULL UNIQUE,
                daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price >= 0),
                availability_status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
                rent_start_date DATE NOT NULL,
                rent_end_date DATE NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        console.log("Database initialized");
    } catch (error) {
        console.log(error);
    } finally {
        client.release();
    }
}

export default initDB;