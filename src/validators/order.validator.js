//-- Module
import { check } from "express-validator";
import { validationResult } from "express-validator";

const chars = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ"´().-\s]*$/;

export const validateCreateOrder = [
  check("client")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 128 })
    .matches(chars),
  check("cuil").exists().not().isEmpty().isLength({ max: 13 }),
  check("email").exists().not().isEmpty().isEmail().isLength({ max: 128 }),
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
    ]),
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
    res.status(400).send({
      status: "error",
      message: { errors: error.array() },
      title: "Campos incompletos",
    });
  }
};
