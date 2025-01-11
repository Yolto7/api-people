import { AppError, ErrorTypes, StringValueObject } from '@common';

export class PeopleName extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PeopleName {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people name cannot be empty',
        'ERR_INVALID_PEOPLE_NAME'
      );
    }

    return new PeopleName(value);
  }

  update(value: string): PeopleName {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people name cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_NAME'
      );
    }

    const updated = PeopleName.create(value);
    updated.isModified = true;

    return updated;
  }
}
