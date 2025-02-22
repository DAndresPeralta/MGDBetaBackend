export default class CustomError {
  static createError({
    name = "Error",
    cause,
    message,
    code = 1,
    httpCode = 500,
  }) {
    const error = new Error(message, { cause });
    error.name = name;
    error.code = code;
    error.httpCode = httpCode;
    throw error;
  }
}