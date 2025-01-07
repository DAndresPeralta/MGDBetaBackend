// -- Modules
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";

// -- Utils
import logger from "./logger.js";
import config from "../config/dot.js";

// --Errors
import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";
import { Strategy } from "passport-local";

export const createHash = async (password) => {
  const salt = 5;
  try {
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) {
      throw CustomError.createError({
        name: "Hashing Error",
        message: "Error al hashear la contraseña",
        code: EErrors.FAILED_HASH,
      });
    }

    return hashedPassword;
  } catch (error) {
    logger.error(`Error al hashear la contraseña: ${error.message}`);
    throw error;
  }
};

export const isValidPassword = async (password, hashedPassword) => {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      throw CustomError.createError({
        name: "Password Error",
        message: "Contraseña inválida",
        code: EErrors.INVALID_PASSWORD,
      });
    }

    return isValid;
  } catch (error) {
    logger.error(`Error al validar la contraseña: ${error.message}`);
    throw error;
  }
};

export const generateToken = (user) => {
  try {
    if (!user) return;
    const token = jwt.sign(user, config.privateKey, { expiresIn: "1h" });
    return token;
  } catch (error) {
    logger.error(`Error al generar el token: ${error.message}`);
    throw CustomError.createError({
      name: "Token Error",
      cause: error.message,
      message: "Error al generar el token",
      code: EErrors.TOKEN_ERROR,
    });
  }
};

export const checkToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw CustomError.createError({
        name: "Token Error",
        cause: error.message,
        message: "No se encontraron tokens",
        code: EErrors.TOKEN_NOT_FOUND,
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, config.privateKey, (error, credentials) => {
      if (error) {
        throw CustomError.createError({
          name: "Token Error",
          cause: error.message,
          message: "Token expirado",
          code: EErrors.EXPIRED_TOKEN,
        });
      }

      req.user.credentials = credentials; // VER
      next();
    });
  } catch (error) {
    logger.error(
      `Error inesperado durante la verificación del token: ${error.message}`
    );
    throw CustomError.createError({
      name: "Token Error",
      cause: error.message,
      message: "Error interno del servidor",
      code: EErrors.INTERNAL_SERVER_ERROR,
    });
  }
};

export const coockieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

// --- Middlewares
export const passportCall = (Strategy) => {
  return async (req, res, next) => {
    passport.authenticate(Strategy, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        logger.warn(`Usuario no autorizado: ${info.message}`);
        return res
          .status(401)
          .send({ error: info.messages ? info.messages : info.toString() });
      }
      req.user = user;
      logger.info("Usuario autorizado");
      next();
    })(req, res, next);
  };
};

export const authorization = (...role) => {
  try {
    return async (req, res, next) => {
      if (!req.user) return res.status(401).send({ error: { Anauthorized } });

      if (!role.includes(req.user.user.role.toUpperCase()))
        return res.status(401).send({ error: "No Permissions" });
      next();
    };
  } catch (error) {
    logger.error(`Error al autorizar: ${error.message}`);
    throw CustomError.createError({
      name: "Authorization Error",
      cause: error.message,
      message: "Error al autorizar",
      code: EErrors.AUTHORIZATION_ERROR,
    });
  }
};
// ---
