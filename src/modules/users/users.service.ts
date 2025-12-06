import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

// const createUser = async (payload: Record<string, unknown>) => {
//     const { name, email, password, phone, role } = payload;

//     console.log(payload);

//     const emailLowerCased: string = (email as string).toLowerCase();

//     if ((password as string).length < 6) {
//         return "Password must be at least 6 characters long";
//     }

//     const passwordHash = await bcrypt.hash(password as string, 10);

//     const result = await pool.query(
//         `
//         INSERT INTO users (name, email, password, phone, role)
//         VALUES ($1, $2, $3, $4, $5)
//         RETURNING *;
//     `,
//         [name, emailLowerCased, passwordHash, phone, role]
//     );

//     return result.rows[0];
// };

const getUser = async (id: number) => {
    console.log('id from user service:', id, typeof id);
    const result = await pool.query(
        `
        SELECT * FROM users WHERE id = $1;
    `,
        [id]
    );

    return result.rows[0];
};
const getUsers = async () => {
    const result = await pool.query(`
        SELECT * FROM users;
    `);

    return result.rows;
};

const updateUser = async (
    name: string,
    email: string,
    phone: string,
    role: string,
    id: number
) => {
    const result = await pool.query(
        `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
        [name, email, phone, role, id]
    );

    return result;
};

const deleteUser = async (id: number) => {
    const result = await pool.query(
        ` DELETE FROM users WHERE id = $1;`, [id]
    );

    return result;
};

export const userServices = {
    getUser,
    getUsers,
    updateUser,
    deleteUser
};
