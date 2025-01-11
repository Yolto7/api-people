import { DomainEvent, cuidaRole, UniqueId } from '@common';

export interface UserCreatedEventData {
  names: string;
  email: string;
  role: cuidaRole;
  password: string;
}

interface UserCreatedEventInput {
  aggregateId: UniqueId;
  eventId?: UniqueId;
  occurredOn?: string;
  data: UserCreatedEventData;
}

export class UserCreatedDomainEvent extends DomainEvent {
  static readonly ENTITY = 'user';
  static readonly EVENT_NAME = `custom.${UserCreatedDomainEvent.ENTITY}.created`;

  readonly data: UserCreatedEventData;

  constructor({ aggregateId, eventId, occurredOn, data }: UserCreatedEventInput) {
    super({
      eventName: UserCreatedDomainEvent.EVENT_NAME,
      entity: UserCreatedDomainEvent.ENTITY,
      aggregateId,
      eventId,
      occurredOn,
    });

    this.data = data;
  }
}
