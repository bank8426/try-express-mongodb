import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_END || "development"}.local` });

export const { PORT, NODE_ENV } = process.env;
