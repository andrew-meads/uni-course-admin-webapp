import dotenv from "dotenv";
dotenv.config();

export const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
export const PORT = process.env.PORT ?? 3000;
export const DB_URL = process.env.DB_URL;