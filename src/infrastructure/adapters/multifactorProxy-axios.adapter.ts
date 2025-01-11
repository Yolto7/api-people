import { AppError, AxiosClientFactory, ErrorTypes, Logger, SysTokenProvider } from '@common';

import { Config } from '@config';
import {
  MultifactorProxyPort,
  SendEmailInput,
  VerifyInput,
} from '@domain/ports/multifactorProxy.port';

export class MultifactorProxyAdapter implements MultifactorProxyPort {
  private axios;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly sysTokenProvider: SysTokenProvider
  ) {
    this.axios = AxiosClientFactory.getClient({
      baseUrl: this.config.MULTIFACTORS_API_BASE_URL,
    });
  }

  private setSysAccessToken(): void {
    this.axios.defaults.headers.common['Authorization'] =
      `Bearer ${this.sysTokenProvider.get()?.accessToken || ''}`;
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    try {
      this.setSysAccessToken();

      const { data } = await this.axios.post(`/email`, {
        userId: input.userId,
        type: input.type,
        email: input.email,
        subject: input.subject,
        message: input.message,
      });
      return data.data;
    } catch (error: any) {
      this.logger.error(`Error in MultifactorProxyPort of sendEmail: ${JSON.stringify(error)}}`);
      if (error.response?.data.code === 'ERR_USER_ALREADY_VERIFIED') {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'User is already verified',
          'ERR_USER_ALREADY_VERIFIED'
        );
      } else {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'Multifactor could not be resolved',
          'ERR_MULTIFACTOR_UNRESOLVED'
        );
      }
    }
  }

  async verify(input: VerifyInput): Promise<void> {
    try {
      this.setSysAccessToken();

      const { data } = await this.axios.post(`/verify`, input);
      return data.data;
    } catch (error: any) {
      this.logger.error(`Error in MultifactorProxyPort of verify: ${JSON.stringify(error)}}`);
      if (error.response?.data.code === 'ERR_INVALID_VERIFICATION_CODE') {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'Verification code is invalid',
          'ERR_INVALID_VERIFICATION_CODE'
        );
      } else if (error.response?.data.code === 'ERR_VERIFICATION_CODE_EXPIRED') {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'Verification code is expired',
          'ERR_VERIFICATION_CODE_EXPIRED'
        );
      } else {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'Multifactor could not be resolved',
          'ERR_MULTIFACTOR_UNRESOLVED'
        );
      }
    }
  }
}
