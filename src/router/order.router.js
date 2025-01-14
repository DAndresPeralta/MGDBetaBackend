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
router.post("/order", validateCreateOrder, createOrderController);
router.put(
  "/order/:id",
  passportCall("jwt"),
  authorization("ADMIN"),
  updateOrderStatusController
);
router.put(
  "/orderUpdate/:id",
  passportCall("jwt"),
  authorization("ADMIN"),
  updateOrderController
);
router.get("/pdfview/:id", viewPDFController);
router.get("/pdfrec/:id", regeneratePDF);

export default router;
