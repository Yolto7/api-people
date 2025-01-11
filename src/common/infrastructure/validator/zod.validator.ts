import { SafeParseReturnType, ZodIssueBase } from 'zod';

import { AppError, ErrorTypes } from '../../domain/error';

export abstract class ZodValidator {
  static validateSchema<T = any>(response: SafeParseReturnType<unknown, T>): T {
    if (!response.success) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'Invalid payload supplied',
        'ERR_INVALID_PAYLOAD',
        response.error?.issues.map((x: ZodIssueBase) => ({
          key: x.path.join('.'),
          message: x.message,
        }))
      );
    }

    return response.data;
  }
}
