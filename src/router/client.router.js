// -- Modules
import express from "express";

// -- Controllers
import {
  createClienteController,
  getAllClientsController,
  getClientByIdController,
  updateClientController,
  updateClientStatusController,
} from "../controllers/client.controller.js";

// -- Autorization
import { authorization, passportCall } from "../utils/auth.js";

// -- Validators
import { validateCreateClient } from "../validators/client.validator.js";

const router = express.Router();

router.get("/client", getAllClientsController);
router.get("/client/:id", getClientByIdController);
router.post(
  "/client",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN"),
  validateCreateClient,
  createClienteController
);
router.put(
  "/client/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN"),
  validateCreateClient,
  updateClientController
);
router.put(
  "/delclient/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN"),
  updateClientStatusController
);

export default router;
