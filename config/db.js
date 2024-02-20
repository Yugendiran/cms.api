import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const conn = mysql.createPool(process.env.DB_URL);

export default conn;
