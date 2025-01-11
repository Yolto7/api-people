import { AppError, ErrorTypes, StringValueObject } from '@common';

export class UserLastNames extends StringValueObject {
  private constructor(value: string) {
    super(value, { allowEmptyString: true });
  }

  static create(value: string): UserLastNames {
    return new UserLastNames(value);
  }

  update(value: string): UserLastNames {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User lastNames cannot be empty',
        'ERR_USER_LASTNAMES_EMPTY'
      );
    }
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User lastNames cannot be the same as the current one',
        'ERR_USER_LASTNAMES_SAME'
      );
    }

    const updated = UserLastNames.create(value);
    updated.isModified = true;

    return updated;
  }
}
