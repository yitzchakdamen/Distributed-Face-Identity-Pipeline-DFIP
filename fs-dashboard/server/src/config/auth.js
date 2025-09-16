import { config } from "dotenv";

config();

// Try convet BCRYPT_SALT_ROUNDS env variable to number
let BCRYPT_SALT_ROUNDS_INT;
try {
  BCRYPT_SALT_ROUNDS_INT = parseInt(process.env.BCRYPT_SALT_ROUNDS);
} catch {}

export const authConfig = {
  bcryptSaltRounds: BCRYPT_SALT_ROUNDS_INT || 10,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

export default authConfig;
