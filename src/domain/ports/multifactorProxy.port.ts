import { UniqueId } from '@common';

export enum MultifactorTypes {
  EMAIL = 'EMAIL',
  ACCESS = 'ACCESS',
  RECOVER_PASSWORD = 'RECOVER PASSWORD',
}

export interface SendEmailInput {
  userId: UniqueId;
  type: MultifactorTypes;
  email: string;
  subject: string;
  message: string;
}

export interface VerifyInput {
  userId: UniqueId;
  code: string;
}

export interface MultifactorProxyPort {
  sendEmail(input: SendEmailInput): Promise<void>;
  verify(input: VerifyInput): Promise<void>;
}
