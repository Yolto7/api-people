import { StringValueObject } from '@common';

export class UserPhoto extends StringValueObject {
  private constructor(value: string) {
    super(value, { allowEmptyString: true });
  }

  static create(value: string): UserPhoto {
    return new UserPhoto(value);
  }

  update(newValue: string) {
    const updated = UserPhoto.create(newValue);
    updated.isModified = true;

    return updated;
  }
}
