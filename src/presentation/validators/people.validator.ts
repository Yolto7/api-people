import { z } from 'zod';

import { ZodValidator } from '@common';

import { PeopleCreateInput } from '@application/services/commands/people-create.command.service';

export class PeopleValidator extends ZodValidator {
  static create(payload: unknown) {
    const schema = z.object({
      name: z.string().nonempty(),
      height: z.number().min(1, { message: 'Invalid' }),
      mass: z.number().min(1, { message: 'Invalid' }),
      hairColor: z.string().nonempty(),
      skinColor: z.string().nonempty(),
      eyeColor: z.string().nonempty(),
      birthYear: z
        .string()
        .regex(/^[0-9]{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)
        .nonempty(),
      gender: z.string().nonempty(),
    });

    return this.validateSchema<PeopleCreateInput>(schema.safeParse(payload));
  }
}
