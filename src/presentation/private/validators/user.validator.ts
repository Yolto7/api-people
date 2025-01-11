import { z } from 'zod';

import { ZodValidator } from '@common';

import { REGEX_EMAIL } from '@domain/entities/valueObjects/email.vo';
import { REGEX_CELLPHONE } from '@domain/entities/valueObjects/cellphone.vo';
import { UserUpdateInput } from '@application/services/commands/user-update.command.service';
import { UserVerifyCommandInput } from '@application/services/commands/user-verifyCode.command.service';
import { UserPhotoUploadInput } from '@application/services/commands/userPhoto-upload.command.service';

export default class UserPrivateValidator extends ZodValidator {
  static update(payload: unknown) {
    const schema = z.object({
      documentType: z.string().optional(),
      documentNumber: z.string().optional(),
      names: z.string().optional(),
      lastNames: z.string().optional(),
      email: z.string().regex(REGEX_EMAIL).optional(),
      cellphone: z.string().regex(REGEX_CELLPHONE).optional(),
      cellphoneToken: z.string().optional(),
    });

    return this.validateSchema<UserUpdateInput>(schema.safeParse(payload));
  }

  static uploadPhoto(payload: unknown) {
    const schema = z.object({
      file: z
        .object({
          content: z.instanceof(Buffer),
          encoding: z.string(),
          filename: z.string(),
          mimetype: z.string(),
          truncated: z.boolean(),
        })
        .refine(
          (file: any) => file?.mimetype?.includes('jpeg') || file?.mimetype?.includes('png'),
          'Only jpeg or png file are supported'
        )
        .refine((file: any) => file?.content.byteLength <= 1000 * 1000, 'File size exceeds limit'),
    });

    return this.validateSchema<UserPhotoUploadInput>(schema.safeParse(payload));
  }

  static verify(payload: unknown) {
    const schema = z.object({
      code: z.string(),
    });

    return this.validateSchema<UserVerifyCommandInput>(schema.safeParse(payload));
  }
}
