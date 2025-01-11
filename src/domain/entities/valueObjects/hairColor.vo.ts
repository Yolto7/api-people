import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleHairColor extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleHairColor {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people hair color cannot be empty',
        'ERR_INVALID_PEOPLE_HAIR_COLOR'
      );
    }

    return new PeopleHairColor(value);
  }

  update(value: string): PeopleHairColor {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people hair color cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_HAIR_COLOR'
      );
    }

    const updated = PeopleHairColor.create(value);
    updated.isModified = true;

    return updated;
  }
}
