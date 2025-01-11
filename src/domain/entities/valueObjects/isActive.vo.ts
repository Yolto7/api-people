import { AppError, BooleanValueObject, ErrorTypes } from '@common';

export class UserIsActive extends BooleanValueObject {
  private constructor(value: boolean) {
    super(value);
  }

  static create(value: boolean): UserIsActive {
    return new UserIsActive(value);
  }

  update(newValue: boolean): UserIsActive {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User isActive cannot be the same as the current one',
        'ERR_USER_IS_ACTIVE_SAME'
      );
    }

    const updated = UserIsActive.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
