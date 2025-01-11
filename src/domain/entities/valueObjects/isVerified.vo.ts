import { AppError, BooleanValueObject, ErrorTypes } from '@common';

export class UserIsVerified extends BooleanValueObject {
  private constructor(value: boolean) {
    super(value);
  }

  static create(value: boolean): UserIsVerified {
    return new UserIsVerified(value);
  }

  update(newValue: boolean): UserIsVerified {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User isVerified cannot be the same as the current one',
        'ERR_USER_IS_VERIFIED_SAME'
      );
    }

    const updated = UserIsVerified.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
