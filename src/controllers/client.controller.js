// -- Services
import {
  createClient,
  getAllClients,
  getClientByCuil,
  getClientByEmail,
  getClientById,
  getLastClient,
  updateClient,
  updateClientStatus,
} from "../services/client.services.js";

// -- Utils
import logger from "../utils/logger.js";

// -- Errors
import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";
import { cli } from "winston/lib/winston/config/index.js";

// -- Funtions

const codeIncrement = (lastClient) => {
  try {
    const prefijo = lastClient.slice(0, 1);
    const num = parseInt(lastClient.slice(1), 10);

    let newNum = num + 1;
    let newPrefijo = prefijo;

    if (newNum > 99999) {
      newNum = 1;
      newPrefijo = String.fromCharCode(prefijo.charCodeAt(0) + 1);
    }

    let formatNum = newNum.toString().padStart(5, "0");
    return `${newPrefijo}${formatNum}`;
  } catch (error) {
    logger.error(`Error al incrementar la serie: ${error.message}`);
    return null;
  }
};

// -- Controllers
export const getAllClientsController = async (req, res) => {
  try {
    const result = await getAllClients();

    if (result.length === 0) {
      throw CustomError.createError({
        name: "Empty DB",
        message: "No se encontraron clientes",
        code: EErrors.EMPTY_DB.code,
        httpCode: EErrors.EMPTY_DB.httpCode,
      });
    }

    logger.info("Clientes encontrados");
    res.status(200).send({ result });
  } catch (error) {
    logger.error(`Error al obtener clientes: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const getClientByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getClientById(id);

    if (!result) {
      throw CustomError.createError({
        name: "Not Found",
        message: "No se encontró el cliente",
        code: EErrors.NOT_FOUND.code,
        httpCode: EErrors.NOT_FOUND.httpCode,
      });
    }

    logger.info("Cliente encontrado");
    res.status(200).send({ result });
  } catch (error) {
    logger.error(`Error al obtener la orden: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const createClienteController = async (req, res) => {
  try {
    const { companyName, cuil, email, address, taxpayer } = req.body;
    const lastClient = await getLastClient();

    const newCodeNumber = lastClient
      ? codeIncrement(lastClient.code)
      : `C00001`;

    // ----- Verify exist client by Cuil and Email
    const existCuil = await getClientByCuil(cuil);
    const existEmail = await getClientByEmail(email);
    if (existCuil || existEmail) {
      throw CustomError.createError({
        name: "Not Found",
        message: "Cliente registrado previamente",
        code: EErrors.USER_ALREADY_EXISTS.code,
        httpCode: EErrors.USER_ALREADY_EXISTS.httpCode,
      });
    }
    // ----- Verify exist client by Cuil and Email

    const client = {
      code: newCodeNumber,
      companyName,
      cuil,
      email,
      address,
      taxpayer,
      status: true,
    };

    const result = await createClient(client);

    logger.info("Cliente creado");
    res.status(200).send({ result, message: "Cliente creado exitosamente" });
  } catch (error) {
    logger.error(`Error al crear el cliente: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const updateClientController = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, cuil, email, address, taxpayer } = req.body;

    const client = {
      companyName,
      cuil,
      email,
      address,
      taxpayer,
    };

    const clientToUpdate = await getClientById(id);

    if (!clientToUpdate) {
      logger.error("No se encontró el cliente");
      throw CustomError.createError({
        name: "Not Found",
        message: "No se encontró el cliente",
        code: EErrors.NOT_FOUND.code,
        httpCode: EErrors.NOT_FOUND.httpCode,
      });
    }

    Object.assign(clientToUpdate, client);

    const result = await updateClient(id, clientToUpdate);
    logger.info("Cliente actualizado");
    res.status(200).send({ result, message: "Cliente actualizado" });
  } catch (error) {
    logger.error(`Error al actualizar el cliente: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};

export const updateClientStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const clientToUpdate = await getClientById(id);

    if (!clientToUpdate) {
      throw CustomError.createError({
        name: "Not Found",
        message: "Cliente inexistente",
        code: EErrors.NOT_FOUND.code,
        httpCode: EErrors.NOT_FOUND.httpCode,
      });
    }

    const result = await updateClientStatus(id, status);
    logger.info("Cliente eliminado");
    res.status(200).send({ result, message: "Cliente eliminado" });
  } catch (error) {
    logger.error(`Error al eliminar el cliente por status: ${error.message}`);
    const statusCode = error.httpCode || 500;
    res.status(statusCode).send({ message: error.message, code: error.code });
  }
};
