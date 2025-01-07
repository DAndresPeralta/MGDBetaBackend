// -- Module
import express from "express";

// -- Controllers
import {
  getAllUserssController,
  createUserController,
} from "../controllers/user.controller.js";

// -- Validators
import { validateUserRegister } from "../validators/user.validator.js";

// -- Autorization
import { authorization, passportCall } from "../utils/auth.js";

const router = express.Router();

router.get("/user", getAllUserssController);
router.post(
  "/user",
  passportCall("jwt"),
  authorization("MASTER"),
  validateUserRegister,
  createUserController
);

export default router;
