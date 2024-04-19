import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT ?? 3000;

export const DB_URL = process.env.DB_URL;

export const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
export const GITHUB_ORG = process.env.GITHUB_ORG;
export const GIT_TEMP_DIR = process.env.GIT_TEMP_DIR;

export const SMTP_SERVER = process.env.SMTP_SERVER;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USERNAME = process.env.SMTP_USERNAME;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
export const SMTP_FROM = process.env.SMTP_FROM;
export const SMTP_BCC = process.env.SMTP_BCC;
