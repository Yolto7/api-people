import { AppError, ErrorTypes, StringValueObject } from '@common';

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserEmail extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserEmail {
    this.validate(value);
    return new UserEmail(value);
  }

  private static validate(value: string) {
    if (!REGEX_EMAIL.test(value)) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `User email ${value} is invalid`,
        'ERR_INVALID_USER_EMAIL'
      );
    }
  }

  update(newValue: string): UserEmail {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User email cannot be the same as the current one',
        'ERR_USER_EMAIL_SAME'
      );
    }

    const updated = UserEmail.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
