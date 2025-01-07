// -- Services
import {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserByEmail,
} from "../services/user.services.js";

// -- Utils
import logger from "../utils/logger.js";
import { createHash } from "../utils/auth.js";

// -- Errors
import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";
import { generateUserErrorInfo } from "../errors/info.js";

export const getAllUserssController = async (req, res) => {
  try {
    const result = await getAllUsers();

    if (result.length === 0) {
      logger.warn("No se encontraron usuarios.");
      throw CustomError.createError({
        name: "Empty DB",
        cause: generateUserErrorInfo(),
        message: "No se encontraron usuarios",
        code: EErrors.EMPTY_DB,
      });
    }
    logger.info("Usuarios obtenidos con éxito.");
    res.send({ result });
  } catch (error) {
    logger.error(`Error al obtener los usuarios: ${error.message}`);
    res.send({ message: error.message });
  }
};

export const createUserController = async (req, res) => {
  try {
    const { firstName, lastName, userName, email, role, password } = req.body;

    const userByUsername = await getUserByUsername(userName);
    const userByEmail = await getUserByEmail(email);

    if (userByUsername || userByEmail) {
      logger.warn("El usuario ya esta registrado.");
      throw CustomError.createError({
        name: "User already exists",
        cause: generateUserErrorInfo(),
        message: "El usuario ya esta registrado",
        code: EErrors.USER_ALREADY_EXISTS,
      });
    } else {
      const newUser = {
        firstName,
        lastName,
        userName,
        email,
        role: role.toUpperCase(),
        password: await createHash(password),
      };

      const result = await createUser(newUser);
      logger.info("Usuario creado con éxito.");
      res.send({ result });
    }
  } catch (error) {
    logger.error(`Error al crear el usuario: ${error.message}`);
    res.send({ message: error.message });
  }
};
