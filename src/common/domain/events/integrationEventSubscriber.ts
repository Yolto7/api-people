import { IntegrationEvent, IntegrationEventClass } from './integrationEvent';

export interface IntegrationEventSubscriber<T extends IntegrationEvent> {
  subscribedTo(): Array<IntegrationEventClass>;
  on(integrationEvent: T): Promise<void>;
}
