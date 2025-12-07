import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async (payload: Record<string, unknown>) => {
    const { name, email, password, phone, role } = payload;

    const emailLowerCased: string = (email as string).toLowerCase();

    if ((password as string).length < 6) {
        return "Password must be at least 6 characters long";
    }

    const passwordHash = await bcrypt.hash(password as string, 10);

    const result = await pool.query(
        `
        INSERT INTO users (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, phone, role;
    `,
        [name, emailLowerCased, passwordHash, phone, role]
    );

    return result.rows[0];
};

const signInUser = async (email: string, password: string) => {
    const result = await pool.query(
        `
        SELECT *
        FROM users 
        WHERE email = $1;
        `, 
        [email]
    );
    

    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];

    const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return false;
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        config.jwtSecret as string,
        {
            expiresIn: "7d",
        }
    );

    return { token, userInfo };
};

export const authServices = {
    createUser,
    signInUser,
};
