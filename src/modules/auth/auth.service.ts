import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async (payload: Record<string, unknown>) => {
    const { name, email, password, phone, role } = payload;

    console.log(payload);

    const emailLowerCased: string = (email as string).toLowerCase();

    if ((password as string).length < 6) {
        return "Password must be at least 6 characters long";
    }

    const passwordHash = await bcrypt.hash(password as string, 10);

    const result = await pool.query(
        `
        INSERT INTO users (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `,
        [name, emailLowerCased, passwordHash, phone, role]
    );

    return result.rows[0];
};

const signInUser = async (email: string, password: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1;`, [
        email,
    ]);

    console.log({ result });
    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return false;
    }

    const token = jwt.sign(
        { name: user.name, email: user.email, role: user.role },
        config.jwtSecret as string,
        {
            expiresIn: "7d",
        }
    );

    console.log({ token });

    return { token, user };
};

export const authServices = {
    createUser,
    signInUser,
};
