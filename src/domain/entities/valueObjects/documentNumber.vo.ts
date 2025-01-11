import { AppError, ErrorTypes, StringValueObject } from '@common';

export class UserDocumentNumber extends StringValueObject {
  private constructor(value: string) {
    super(value, { allowEmptyString: true });
  }

  static create(value: string): UserDocumentNumber {
    return new UserDocumentNumber(value);
  }

  update(value: string): UserDocumentNumber {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User documentNumber cannot be empty',
        'ERR_USER_DOCUMENT_NUMBER_EMPTY'
      );
    }
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User documentNumber cannot be the same as the current one',
        'ERR_USER_DOCUMENT_NUMBER_SAME'
      );
    }

    const updated = UserDocumentNumber.create(value);
    updated.isModified = true;

    return updated;
  }
}
