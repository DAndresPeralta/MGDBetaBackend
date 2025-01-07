// --- Módulos
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// --- Imports files
import config from "./config/dot.js";
import logger from "./utils/logger.js";
import compression from "./config/compression.js";

// --- Routers
import userRouter from "./router/user.router.js";
import orderRouter from "./router/order.router.js";
import authRouter from "./router/auth.router.js";
import testRouter from "./router/prueba.router.js";

// --- Passport
import passport from "passport";
import initializPassport from "./config/passport.config.js";

// --- Ppal. Settings
const app = express();
const PORT = config.port;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.use(passport.initialize());
initializPassport();
app.use(
  cors({
    origin: config.corsOrigin,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);
app.use(compression);

// --- BD Settings
mongoose
  .connect(config.mongoUrl)
  .then(() => {
    logger.info("Conectado a la base de datos");
  })
  .catch((error) => {
    logger.error(`Error al conectar a la base de datos: ${error.message}`);
  });

// --- Routes
app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", orderRouter);
app.use("/api", testRouter);

// --- Server up
app.listen(PORT, () => {
  logger.info(`Server running on port: ${PORT}`);
});
