import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleEyecolor extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleEyecolor {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people eye color cannot be empty',
        'ERR_INVALID_PEOPLE_EYE_COLOR'
      );
    }

    return new PeopleEyecolor(value);
  }

  update(value: string): PeopleEyecolor {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people eye color cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_EYE_COLOR'
      );
    }

    const updated = PeopleEyecolor.create(value);
    updated.isModified = true;

    return updated;
  }
}
