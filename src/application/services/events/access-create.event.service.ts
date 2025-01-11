import { DomainEventSubscriber, DomainEventClass, UniqueId, Logger } from '@common';

import { UserVerifiedDomainEvent } from '@domain/events/userVerified.event';
import { AccessCreateInput, AccessProxyPort, AccessTypes } from '@domain/ports/accessProxy.port';
import { Onboarding, OnboardingProxyPort } from '@domain/ports/onboarding.port';

export class AccessCreateEventServiceOnUserVerified
  implements DomainEventSubscriber<UserVerifiedDomainEvent>
{
  constructor(
    private readonly logger: Logger,
    private readonly accessProxyPort: AccessProxyPort,
    private readonly onboardingProxyPort: OnboardingProxyPort
  ) {}

  subscribedTo(): DomainEventClass[] {
    return [UserVerifiedDomainEvent];
  }

  async on({ aggregateId, data }: UserVerifiedDomainEvent) {
    this.logger.info(`The creation of accesses by ondording for email ${data.email} started`);

    await this.createAccessesByOnboardingRecursive({
      userId: aggregateId,
      email: data.email,
    });

    this.logger.info(`The creation of accesses by ondording for email ${data.email} finished`);
  }

  private async createAccessesByOnboardingRecursive(input: {
    userId: UniqueId;
    email: string;
    page?: string;
  }): Promise<void> {
    const { onboardings, page: nextPage } = await this.onboardingProxyPort.search(
      input.email,
      input.page
    );

    this.logger.info(`onboardings: ${onboardings.length}`);
    await this.createAccessesByOnboarding(input.userId, onboardings);
    if (!nextPage) {
      return;
    }

    return this.createAccessesByOnboardingRecursive({
      userId: input.userId,
      email: input.email,
      page: nextPage,
    });
  }

  private async createAccessesByOnboarding(userId: UniqueId, onboardings: Onboarding[]) {
    if (!onboardings.length) {
      return;
    }

    await Promise.allSettled(
      onboardings.map(async ({ buildingId, apartments, parkingLots, warehouses }) => {
        const input: AccessCreateInput = {
          type: AccessTypes.BUILDING,
          userId,
          buildingId,
          apartments,
        };

        parkingLots.length && (input.parkingLots = parkingLots);
        warehouses.length && (input.warehouses = warehouses);

        return this.accessProxyPort.create(input);
      })
    );
  }
}
