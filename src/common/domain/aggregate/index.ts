import { AuditEntry, Entity } from '../entity';
import { DomainEvent } from '../events/domainEvent';

export abstract class AggregateRoot<T extends AuditEntry> extends Entity<T> {
  private domainEvents: Array<DomainEvent> = [];

  pullDomainEvents(): Array<DomainEvent> {
    return this.domainEvents;
  }

  record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
