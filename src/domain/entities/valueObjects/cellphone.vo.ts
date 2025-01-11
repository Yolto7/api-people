import { AppError, ErrorTypes, StringValueObject } from '@common';

export const REGEX_CELLPHONE = /^\+[0-9]{1,3}( [0-9]{1,3})?-[0-9]{9,}$/;

export class UserCellphone extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserCellphone {
    this.validate(value);
    return new UserCellphone(value);
  }

  private static validate(value: string) {
    if (!REGEX_CELLPHONE.test(value)) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `User cellphone ${value} is invalid`,
        'ERR_INVALID_USER_CELLPHONE'
      );
    }
  }

  update(value: string): UserCellphone {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User cellphone cannot be the same as the current one',
        'ERR_USER_CELLPHONE_SAME'
      );
    }

    const updated = UserCellphone.create(value);
    updated.isModified = true;

    return updated;
  }
}
