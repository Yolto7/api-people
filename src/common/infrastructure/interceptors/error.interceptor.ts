import { MiddlewareObj } from '@middy/core';

import { AppError } from '../../domain/error';
import { Logger } from '../../domain/logger';

export class ErrorInterceptor {
  constructor(private readonly logger: Logger) {}

  use(): MiddlewareObj {
    return {
      onError: ({ error }: any) => {
        this.logger.error(JSON.stringify(error));

        const body = { succes: false, message: error.message };
        if (error instanceof AppError) {
          Object.assign(body, {
            code: error.errorCode,
            payload: error.payload,
          });
        }

        return {
          statusCode: error.httpCode || 500,
          isBase64Encoded: false,
          body: JSON.stringify(body),
        };
      },
    };
  }
}
