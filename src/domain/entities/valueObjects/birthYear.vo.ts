import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleBirthyear extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleBirthyear {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people birth year cannot be empty',
        'ERR_INVALID_PEOPLE_BIRTH_YEAR'
      );
    }

    return new PeopleBirthyear(value);
  }

  update(value: string): PeopleBirthyear {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people birth year cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_BIRTH_YEAR'
      );
    }

    const updated = PeopleBirthyear.create(value);
    updated.isModified = true;

    return updated;
  }
}
