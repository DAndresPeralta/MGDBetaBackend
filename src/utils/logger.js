import winston from "winston";

const customLevel = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    fatal: "red",
    error: "magenta",
    warn: "yellow",
    info: "blue",
    debug: "cyan",
  },
};

winston.addColors(customLevel.colors);

const logger = winston.createLogger({
  levels: customLevel.levels,
  format: winston.format.combine(
    winston.format.colorize({ colors: customLevel.colors }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({ level: "debug" }),
    new winston.transports.File({
      level: "warn",
      filename: "./errors.log",
    }),
  ],
});

export default logger;
