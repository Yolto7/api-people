import { RequestAsyncContext, AsyncContext } from '../../infrastructure/context';
import { CUIDA_CONTANST } from '../constants';
import { UniqueEntityId, UniqueId } from '../entity/uniqueEntityId';
import { getToday } from '../../infrastructure/helpers/date';

export interface DomainEventInput {
  aggregateId: UniqueId;
  entity: string;
  eventName: string;
  eventId?: UniqueId;
  occurredOn?: string;
}

export interface DomainEventClass {
  EVENT_NAME: string;
}

export abstract class DomainEvent {
  readonly aggregateId: UniqueId;
  readonly entity: string;
  readonly eventName: string;
  readonly eventId: UniqueId;
  readonly occurredOn: string;
  readonly context: RequestAsyncContext | undefined;

  constructor({ aggregateId, entity, eventName, eventId, occurredOn }: DomainEventInput) {
    this.aggregateId = aggregateId;
    this.entity = entity;
    this.eventName = eventName;
    this.eventId = eventId || UniqueEntityId.random();
    this.occurredOn = occurredOn || getToday('YYYY-MM-DD HH:mm:ss');
    this.context = AsyncContext.get<RequestAsyncContext>(CUIDA_CONTANST.ASYNCCONTEXT.REQUEST);
  }
}
