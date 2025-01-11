import { AppError, BooleanValueObject, ErrorTypes } from '@common';

export class UserIsUploadedPhoto extends BooleanValueObject {
  private constructor(value: boolean) {
    super(value);
  }

  static create(value: boolean): UserIsUploadedPhoto {
    return new UserIsUploadedPhoto(value);
  }

  update(newValue: boolean): UserIsUploadedPhoto {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User IsUploadedPhoto cannot be the same as the current one',
        'ERR_USER_IS_VERIFIED_SAME'
      );
    }

    const updated = UserIsUploadedPhoto.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
