import { pool } from "../../config/db";

const getUser = async (id: number) => {
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
