import dotenv from "dotenv";
import logger from "../utils/logger.js";
// dotenv.config();

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

logger.info(`Ambiente: ${process.env.NODE_ENV}`);

export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  privateKey: process.env.PRIVATE_KEY,
  refreshPrivateKey: process.env.REFRESH_PRIVATE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  userEmail: process.env.USER_EMAIL,
  passwordEmail: process.env.USER_PASSWORD,
};
