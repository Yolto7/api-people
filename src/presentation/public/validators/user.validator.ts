import { z } from 'zod';

import { ZodValidator } from '@common';

import { REGEX_EMAIL } from '@domain/entities/valueObjects/email.vo';
import { REGEX_CELLPHONE } from '@domain/entities/valueObjects/cellphone.vo';
import { UserCreateInput } from '@application/services/commands/user-create.command.service';

export const REGEX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{12,}$/;

export default class UserPublicValidator extends ZodValidator {
  static create(payload: unknown) {
    const schema = z.object({
      names: z.string(),
      lastNames: z.string(),
      email: z.string().regex(REGEX_EMAIL),
      cellphone: z.string().regex(REGEX_CELLPHONE),
      password: z.string().regex(REGEX_PASSWORD),
    });

    return this.validateSchema<UserCreateInput>(schema.safeParse(payload));
  }
}
