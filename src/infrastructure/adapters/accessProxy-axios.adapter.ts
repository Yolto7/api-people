import {
  AppError,
  AxiosClientFactory,
  ErrorTypes,
  Logger,
  SysTokenProvider,
  UniqueId,
} from '@common';

import { Config } from '@config';
import { Access, AccessCreateInput, AccessProxyPort } from '@domain/ports/accessProxy.port';

export class AccessProxyAdapter implements AccessProxyPort {
  private axios;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly sysTokenProvider: SysTokenProvider
  ) {
    this.axios = AxiosClientFactory.getClient({
      baseUrl: this.config.ACCESSES_API_BASE_URL,
    });
  }

  private setSysAccessToken(): void {
    this.axios.defaults.headers.common['Authorization'] =
      `Bearer ${this.sysTokenProvider.get()?.accessToken || ''}`;
  }

  async getById(id: UniqueId): Promise<Access> {
    try {
      this.setSysAccessToken();

      const { data } = await this.axios.get(`/${id}`);
      return data.data;
    } catch (error) {
      this.logger.error(`Error in AccessProxyPort of getById: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'Access could not be resolved',
        'ERR_ACCESS_UNRESOLVED'
      );
    }
  }

  async create(input: AccessCreateInput): Promise<void> {
    try {
      this.setSysAccessToken();

      await this.axios.post(`/`, input);
    } catch (error: any) {
      this.logger.error(`Error in AccessProxyPort of create: ${JSON.stringify(error)}`);
      if (error.response?.data.code === 'ERR_ACCESS_ALREADY_EXISTS') {
        return;
      } else {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          'Access could not be resolved',
          'ERR_ACCESS_UNRESOLVED'
        );
      }
    }
  }
}
