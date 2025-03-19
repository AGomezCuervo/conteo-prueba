export const ErrorCodes = {
  NO_ERROR: "noError",
  SERVER_ERROR: "serverError",
  CLIENT_ERROR: "clientError",
  INCOMPLETE_FORM: "incompleteForm",
  USER_NOT_FOUND: "userNotFound",
  INVALID_CREDENTIALS: "invalidCredentials",
  EMAIL_ALREADY_IN_USE: "emailAlreadyInUse",
  COMPANY_ALREADY_REGISTERED: "companyAlreadyRegistered",
  COMPANY_NOT_FOUND: "companyNotFound",
  PRODUCT_ALREADY_REGISTERED: "productAlreadyRegistered",
}
export const errorMessages = new Map();

errorMessages.set(ErrorCodes.NO_ERROR, "");
errorMessages.set(ErrorCodes.SERVER_ERROR, "Error: Ups, algo salió mal, intenta de nuevo más tarde");
errorMessages.set(ErrorCodes.CLIENT_ERROR, "Error: Ups, algo salió mal, consulta con ayuda al cliente");
errorMessages.set(ErrorCodes.INCOMPLETE_FORM, "Error: Formulario incompleto, revisa los campos");
errorMessages.set(ErrorCodes.USER_NOT_FOUND, "Error: Usuario no encontrado");
errorMessages.set(ErrorCodes.INVALID_CREDENTIALS, "Error: Credenciales inválidas");
errorMessages.set(ErrorCodes.EMAIL_ALREADY_IN_USE, "Error: Correo electrónico en uso...");
errorMessages.set(ErrorCodes.COMPANY_ALREADY_REGISTERED, "Error: Ya tienes una empresa con ese nombre");
errorMessages.set(ErrorCodes.COMPANY_NOT_FOUND, "Error: La empresa no existe");
errorMessages.set(ErrorCodes.PRODUCT_ALREADY_REGISTERED, "Error: Ya tienes un producto con ese nombre");

export const SQLErrorCodes = {
  SQLITE_CONSTRAINT_UNIQUE: 0,
  CUSTOM_NOT_FOUND: 1,
}

export class DatabaseError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.name = "databaseError";
    this.code = errorCode;
  }
}
