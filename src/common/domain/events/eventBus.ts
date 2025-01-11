import { DomainEvent } from './domainEvent';
import { IntegrationEvent } from './integrationEvent';

export interface EventBus {
  publish(events: Array<DomainEvent | IntegrationEvent>): Promise<void>;
}
