import { AppError, AxiosClientFactory, ErrorTypes, Logger, SysTokenProvider } from '@common';

import { Config } from '@config';
import { OnboardingProxyPort, OnboardingSearchResponse } from '@domain/ports/onboarding.port';

export class OnboardingProxyAdapter implements OnboardingProxyPort {
  private axios;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly sysTokenProvider: SysTokenProvider
  ) {
    this.axios = AxiosClientFactory.getClient({
      baseUrl: this.config.ONBOARDINGS_API_BASE_URL,
    });
  }

  private setSysAccessToken(): void {
    this.axios.defaults.headers.common['Authorization'] =
      `Bearer ${this.sysTokenProvider.get()?.accessToken || ''}`;
  }

  async search(email: string, page?: string): Promise<OnboardingSearchResponse> {
    try {
      this.setSysAccessToken();

      const { data } = await this.axios.get(`?email=${email}${page ? `&page=${page}` : ''}`);
      return data.data;
    } catch (error) {
      this.logger.error(`Error in OnboardingProxyPort of getByEmail: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'Onboarding could not be resolved',
        'ERR_ONBOARDING_UNRESOLVED'
      );
    }
  }
}
