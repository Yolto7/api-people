import { AppError, ErrorTypes, StringValueObject } from '@common';

export class UserDocumentType extends StringValueObject {
  private constructor(value: string) {
    super(value, { allowEmptyString: true });
  }

  static create(value: string): UserDocumentType {
    return new UserDocumentType(value);
  }

  update(value: string): UserDocumentType {
    if (!value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User documentType cannot be empty',
        'ERR_USER_DOCUMENT_TYPE_EMPTY'
      );
    }
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User documentType cannot be the same as the current one',
        'ERR_USER_DOCUMENT_TYPE_SAME'
      );
    }

    const updated = UserDocumentType.create(value);
    updated.isModified = true;

    return updated;
  }
}
