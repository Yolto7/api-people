import { MiddlewareObj } from '@middy/core';

import { AppError, ErrorTypes } from '../../domain/error';
import { AxiosClientFactory } from '../axios';
import { Logger } from '../../domain/logger';

interface Config {
  IDENTITIES_API_BASE_URL: string;
  cuida_SYS_USER_EMAIL: string;
  cuida_SYS_USER_PASSWORD: string;
}

export class SysTokenMiddleware {
  private readonly axios;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger
  ) {
    this.axios = AxiosClientFactory.getClient({
      baseUrl: this.config.IDENTITIES_API_BASE_URL,
    });
  }

  async getSysToken() {
    const { data } = await this.axios.post(`/internal/login`, {
      email: this.config.cuida_SYS_USER_EMAIL,
      password: this.config.cuida_SYS_USER_PASSWORD,
    });

    this.logger.info(`SysLogin token created`);
    return {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  }

  use(): MiddlewareObj {
    return {
      before: async (handler) => {
        try {
          const data = await this.getSysToken();
          Object.assign(handler.context, {
            sysTokenAsyncContext: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            },
          });
        } catch (error: any) {
          this.logger.error(`Error in SysTokenMiddleware of sysLogin: ${JSON.stringify(error)}`);
          throw new AppError(
            ErrorTypes.BAD_REQUEST,
            'Identity could not be resolved',
            'ERR_IDENTITY_UNRESOLVED'
          );
        }
      },
    };
  }
}
