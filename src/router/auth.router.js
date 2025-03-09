// -- Module
import express from "express";

// -- Controller
import {
  authUserController,
  loginUserController,
  logoutUserController,
  refreshTokenController,
} from "../controllers/auth.controller.js";

// -- Middleware
import { loginLimiter } from "../middlewares/limiter.middleware.js";

// -- Passport
import { passportCall } from "../utils/auth.js";

const router = express.Router();

router.get("/auth", passportCall("jwt"), authUserController);
router.post("/login", loginLimiter, loginUserController);
router.post("/logout", logoutUserController);
router.post("/refresh", refreshTokenController);

export default router;
