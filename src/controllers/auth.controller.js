// -- Passport
import passport from "passport";

// -- Modules
import { generateRefreshToken, generateToken } from "../utils/auth.js";

// -- Logger
import logger from "../utils/logger.js";
import CustomError from "../errors/CustomError.js";

export const loginUserController = (req, res, next) => {
  try {
    passport.authenticate("login", { session: false }, (err, user, info) => {
      if (err) {
        logger.error(`Error en Passport: ${err.message}`);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (!user) {
        logger.warn("Usuario no autenticado");
        return res.status(401).json({ error: info.message || "No autorizado" });
      }

      const access_token = generateToken({ user });
      const refresh_token = generateRefreshToken({ user });

      res.cookie("jwt", access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 4 * 60 * 60 * 1000,
        sameSite: "none", //VER para LOCAL - usar "lax" o borrar atributo
        domain: "mgdbetabackend.onrender.com",
        path: "/",

        //   path: "/", // This line is to confirm
      });

      res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: 86400000,
        sameSite: "none",
        path: "/api/refresh",
      });

      logger.info("Login exitoso");
      return res
        .status(200)
        .json({ status: "success", message: "Autenticación exitosa" });
    })(req, res, next);
  } catch (error) {
    logger.error(`Error al autenticar usuario: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const authUserController = (req, res) => {
  try {
    if (req.user) {
      // console.log("Usuario autenticado:", req.user);
      return res.status(200).json({ success: true });
    } else {
      console.log("JWT no válido o no autenticado");
      return res
        .status(401)
        .json({ success: false, message: "JWT no válido o no autenticado" });
    }
  } catch (error) {
    console.error("Error en el endpoint /auth:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
};

export const refreshTokenController = (req, res, next) => {
  try {
    passport.authenticate(
      "refresh",
      { session: false },
      (err, payload, info) => {
        if (err) {
          logger.error(`Error en Passport Refresh: ${err.message}`);
          return res.status(500).json({ error: "Error en el servidor" });
        }

        if (!payload) {
          logger.warn("Refresh Token expirado");
          return res
            .status(401)
            .json({ error: info.message || "No autorizado" });
        }

        const newAccessToken = generateToken({ user: payload.user });

        res.cookie("jwt", newAccessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600000,
          sameSite: "none",
        });

        logger.info("Token renovado exitosamente");
        return res.status(200).json({
          status: "success",
          message: "Token renovado exitosamente",
        });
      }
    )(req, res, next);
  } catch (error) {
    logger.error(`Error al renovar token: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const logoutUserController = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: "mgdbetabackend.onrender.com",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      path: "/api/refresh",
    });

    if (!req.cookies.jwt) {
      logger.warn("No se encontró la cookie");

      throw CustomError.createError({
        name: "Not Found",
        message: "No se encontró la cookie",
        code: 404,
      });
    }

    logger.info("Cerrando sesión");

    return res.status(200).send({
      status: "success",
      message: "Cerrando sesión",
      redirect: "/",
    });
  } catch (error) {
    logger.error(`Error al cerrar sesión: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
