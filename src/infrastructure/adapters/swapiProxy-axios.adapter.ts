import { AppError, ErrorTypes, AxiosClientFactory, Logger } from '@common';

import { Config } from '@config';
import { SwapiPeople, SwapiProxyPort } from '@domain/ports/swapiProxy.port';

export class SwapiProxyAdapter implements SwapiProxyPort {
  private axios;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger
  ) {
    this.axios = AxiosClientFactory.getClient({
      baseUrl: this.config.SWAPI_API_BASE_URL,
    });
  }

  async getPeople(): Promise<SwapiPeople[]> {
    try {
      const { data } = await this.axios.get('/people');
      return data.results;
    } catch (error) {
      this.logger.error(`Error in SwapiProxyAdapter of getPeople: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'Swapi result could not be resolved',
        'ERR_SWAPI_UNRESOLVED'
      );
    }
  }
}
