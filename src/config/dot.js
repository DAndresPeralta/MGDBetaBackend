import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  privateKey: process.env.PRIVATE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
  userEmail: process.env.USER_EMAIL,
  passwordEmail: process.env.USER_PASSWORD,
};
