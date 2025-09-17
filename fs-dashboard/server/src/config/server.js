import { config } from "dotenv";

config();

export const serverConfig = {
  port: process.env.PORT || 3000,
  host: process.env.NODE_ENV === "production" ? "0.0.0.0" : (process.env.HOST || "localhost"),
  environment: process.env.NODE_ENV || "development",
};

export default serverConfig;
