const EErrors = {
  USER_NOT_FOUND: { code: 1, httpCode: 404 },
  USER_ALREADY_EXISTS: { code: 2, httpCode: 409 },
  USER_NOT_AUTHORIZED: { code: 3, httpCode: 403 },
  EMPTY_DB: { code: 4, httpCode: 404 },
  FAILED_HASH: { code: 5, httpCode: 500 },
  TOKEN_ERROR: { code: 6, httpCode: 401 },
  TOKEN_NOT_FOUND: { code: 7, httpCode: 401 },
  EXPIRED_TOKEN: { code: 8, httpCode: 401 },
  INTERNAL_SERVER_ERROR: { code: 9, httpCode: 500 },
  AUTHORIZATION_ERROR: { code: 10, httpCode: 403 },
  ORDER_CREATION_ERROR: { code: 11, httpCode: 400 },
  NOT_FOUND: { code: 12, httpCode: 404 },
  BAD_REQUEST: { code: 13, httpCode: 400 },
};

export default EErrors;
