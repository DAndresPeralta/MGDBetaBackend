// -- Modules
import express from "express";

// -- Controllers
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  regeneratePDF,
  updateOrderController,
  updateOrderStatusController,
  viewPDFController,
} from "../controllers/order.controller.js";

// -- Autorization
import { authorization, passportCall } from "../utils/auth.js";

// -- Validators
import { validateCreateOrder } from "../validators/order.validator.js";

const router = express.Router();

router.get("/order", getAllOrdersController);
router.get("/order/:id", getOrderByIdController);
router.post(
  "/order",
  passportCall("jwt"),
  validateCreateOrder,
  createOrderController
);
// Eliminar
router.put(
  "/order/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN"),
  updateOrderStatusController
);
router.put(
  "/orderUpdate/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN"),
  validateCreateOrder,
  updateOrderController
);
router.get(
  "/pdfview/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN", "USER"),
  viewPDFController
);
router.get(
  "/pdfrec/:id",
  passportCall("jwt"),
  authorization("MASTER", "ADMIN", "USER"),
  regeneratePDF
);

export default router;
