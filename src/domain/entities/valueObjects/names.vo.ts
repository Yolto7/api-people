import { AppError, ErrorTypes, StringValueObject } from '@common';

export class UserNames extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserNames {
    return new UserNames(value);
  }

  update(newValue: string): UserNames {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User names cannot be the same as the current one',
        'ERR_USER_NAMES_SAME'
      );
    }

    const updated = UserNames.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
