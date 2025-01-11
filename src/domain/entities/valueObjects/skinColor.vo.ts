import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleSkincolor extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleSkincolor {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people skin color cannot be empty',
        'ERR_INVALID_PEOPLE_SKIN_COLOR'
      );
    }

    return new PeopleSkincolor(value);
  }

  update(value: string): PeopleSkincolor {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people skin color cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_SKIN_COLOR'
      );
    }

    const updated = PeopleSkincolor.create(value);
    updated.isModified = true;

    return updated;
  }
}
