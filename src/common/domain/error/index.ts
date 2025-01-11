export enum ErrorTypes {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  NOT_ALLOWED = 'NOT_ALLOWED',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
}

export class AppError extends Error {
  private static readonly HTTP_CODE_BY_ERROR: Record<ErrorTypes, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    NOT_ALLOWED: 405,
    UNPROCESSABLE_ENTITY: 422,
  };

  readonly httpCode: number;

  constructor(
    errorType: ErrorTypes,
    readonly message: string,
    readonly errorCode: string,
    readonly payload: unknown = undefined
  ) {
    super(message);

    this.httpCode =
      AppError.HTTP_CODE_BY_ERROR[errorType] || AppError.HTTP_CODE_BY_ERROR.BAD_REQUEST;
    this.message = message;
    this.errorCode = errorCode;
    this.payload = payload;
  }
}
