//-- Module
import { check } from "express-validator";
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";

const chars = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ"´’().-\s]*$/;

export const validateCreateOrder = [
  check("product").exists().isArray().not().isEmpty(),
  check("product.*.name")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 128 })
    .matches(chars),
  check("product.*.quantity").exists().isInt({ min: 1 }),
  check("product.*.price").exists().isFloat({ min: 0.1 }),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (error) {
    const errorMessages = error.array().map((err) => {
      return `Campo: "${err.param}" - Mensaje: ${err.msg} - Valor recibido: "${err.value}"`;
    });

    logger.info("Errores de validación:", errorMessages);
    res.status(400).send({
      status: "error",
      message: { errors: error.array() },
      title: "Campos incompletos",
    });
  }
};
