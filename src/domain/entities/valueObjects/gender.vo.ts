import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleGender extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleGender {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people gender cannot be empty',
        'ERR_INVALID_PEOPLE_GENDER'
      );
    }

    return new PeopleGender(value);
  }

  update(value: string): PeopleGender {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people gender cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_GENDER'
      );
    }

    const updated = PeopleGender.create(value);
    updated.isModified = true;

    return updated;
  }
}
