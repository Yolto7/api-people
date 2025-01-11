import { DomainEvent, UniqueId } from '@common';

export interface UserVerifiedEventData {
  email: string;
  isVerified: boolean;
}

interface UserVerifiedEventInput {
  aggregateId: UniqueId;
  eventId?: UniqueId;
  occurredOn?: string;
  data: UserVerifiedEventData;
}

export class UserVerifiedDomainEvent extends DomainEvent {
  static readonly ENTITY = 'user';
  static readonly EVENT_NAME = `custom.${UserVerifiedDomainEvent.ENTITY}.verified`;

  readonly data: UserVerifiedEventData;

  constructor({ aggregateId, eventId, occurredOn, data }: UserVerifiedEventInput) {
    super({
      eventName: UserVerifiedDomainEvent.EVENT_NAME,
      entity: UserVerifiedDomainEvent.ENTITY,
      aggregateId,
      eventId,
      occurredOn,
    });

    this.data = data;
  }
}
