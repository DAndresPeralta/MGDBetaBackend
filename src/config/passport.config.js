// -- Passport
import passport from "passport";
import local from "passport-local";
import jwt, { ExtractJwt } from "passport-jwt";

// -- Services
import { getUserByUsername } from "../services/user.services.js";

// -- Utils
import { coockieExtractor, isValidPassword } from "../utils/auth.js";
import config from "../config/dot.js";

// -- Passport Settings
const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;

const initializePassport = () => {
  // ** Autentication
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "userName" },
      async (userName, password, done) => {
        try {
          const user = await getUserByUsername(userName);

          if (!user)
            return done(null, false, { message: "Usuario inexistente" });

          const passwordValidated = await isValidPassword(
            password,
            user.password
          );

          if (!passwordValidated)
            return done(null, false, { message: "Contraseña inválida" });

          return done(null, user, { message: "Login exitoso" });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([coockieExtractor]),
        secretOrKey: config.jwtSecret,
      },
      async (jwt_payload, done) => {
        try {
            console.log(jwt_payload);
          return done(null, jwt_payload);
        } catch (error) {
            console.log(error);
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;
