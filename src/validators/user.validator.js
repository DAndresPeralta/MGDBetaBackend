//-- Module
import { check } from "express-validator";
import { validationResult } from "express-validator";

const chars = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ]*$/;

export const validateUserRegister = [
  check("firstName")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 15 })
    .matches(chars)
    .withMessage("Solo se permiten letras y números"),
  check("lastName")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 15 })
    .matches(chars)
    .withMessage("Solo se permiten letras y números"),
  check("userName")
    .exists()
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 12 })
    .matches(chars)
    .withMessage("Solo se permiten letras y números"),
  check("email").exists().isEmail(),
  check("role")
    .exists()
    .not()
    .isEmpty()
    .customSanitizer((value) => value.toUpperCase())
    .isIn(["MASTER", "ADMIN", "USER"]),
  check("password")
    .exists()
    .isLength({ min: 8, max: 12 })
    .matches(chars)
    .withMessage("Solo se permiten letras y números"),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];

export const validateUserSign = [
  check("userName")
    .exists()
    .not()
    .isEmpty()
    .isLength({ max: 15 })
    .matches(chars),
  check("password").exists().isLength({ min: 8, max: 12 }).matches(chars),
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
      message: "Campos incompletos",
      title: "Campos incompletos",
    });
  }
};
