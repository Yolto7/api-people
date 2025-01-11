import { AppError, ErrorTypes, NumberValueObject } from '@common';

export class PeopleHeight extends NumberValueObject {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): PeopleHeight {
    if (value <= 0) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people height must be greater than 0',
        'ERR_INVALID_PEOPLE_HEIGHT'
      );
    }

    return new PeopleHeight(value);
  }

  update(value: number): PeopleHeight {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people height cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_HEIGHT'
      );
    }

    const updated = PeopleHeight.create(value);
    updated.isModified = true;

    return updated;
  }
}
