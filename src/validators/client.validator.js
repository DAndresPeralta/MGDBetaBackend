//-- Module
import { check } from "express-validator";
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";

const chars = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ"´().-\s]*$/;

export const validateCreateClient = [
  check("companyName")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 128 })
    .matches(chars),
  check("cuil").exists().not().isEmpty().isLength({ min: 13 }, { max: 13 }),
  check("email")
    .exists()
    .not()
    .isEmpty()
    .isEmail()
    .isLength({ max: 128 })
    .matches(/@/),
  check("taxpayer")
    .exists()
    .not()
    .isEmpty()
    .customSanitizer((value) => value.toUpperCase())
    .isIn([
      "CONSUMIDOR FINAL",
      "IVA EXCENTO",
      "MONOTRIBUTISTA",
      "RESPONSABLE INSCRIPTO",
      "CONSUMIDOR FINAL - MAT. PRIMAS",
      "PRESUPUESTO",
    ]),
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
