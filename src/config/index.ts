import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
    connection_str: process.env.POSTGRESQL_STRING,
    port: process.env.PORT,
};

export default config;
