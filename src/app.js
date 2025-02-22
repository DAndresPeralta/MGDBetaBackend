// --- Módulos
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

// --- Imports files
import config from "./config/dot.js";
import logger from "./utils/logger.js";
import compression from "./config/compression.js";
import "./utils/cron.js";

// --- Routers
import userRouter from "./router/user.router.js";
import orderRouter from "./router/order.router.js";
import clientRouter from "./router/client.router.js";
import authRouter from "./router/auth.router.js";
import testRouter from "./router/prueba.router.js";

// --- Passport
import passport from "passport";
import initializPassport from "./config/passport.config.js";

// --- Ppal. Settings
const app = express();
const PORT = config.port;
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser(config.cookieSecret));
app.use(passport.initialize());
initializPassport();
app.use(
  cors({
    origin: config.corsOrigin,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization, Set-Cookie",
  })
);
app.use(helmet());
// app.options('*', cors());
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
app.use("/api", clientRouter);

// --- Server up
app.listen(PORT, () => {
  logger.info(`Server running on port: ${PORT}`);
});
