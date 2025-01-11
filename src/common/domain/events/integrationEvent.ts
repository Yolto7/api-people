import { RequestAsyncContext, AsyncContext } from '../../infrastructure/context';
import { CUIDA_CONTANST } from '../constants';
import { UniqueEntityId, UniqueId } from '../entity/uniqueEntityId';

export interface IntegrationEventInput {
  entity: string;
  eventName: string;
  eventId?: UniqueId;
  occurredOn?: Date;
}

export interface IntegrationEventClass {
  EVENT_NAME: string;
}

export abstract class IntegrationEvent {
  readonly entity: string;
  readonly eventName: string;
  readonly eventId: UniqueId;
  readonly occurredOn: Date;
  readonly context: RequestAsyncContext | undefined;

  constructor({ entity, eventName, eventId, occurredOn }: IntegrationEventInput) {
    this.entity = entity;
    this.eventName = eventName;
    this.eventId = eventId || UniqueEntityId.random();
    this.occurredOn = occurredOn || new Date();
    this.context = AsyncContext.get<RequestAsyncContext>(CUIDA_CONTANST.ASYNCCONTEXT.REQUEST);
  }
}
