import { DomainEventSubscriber, DomainEventClass } from '@common';

import { UserCreatedDomainEvent } from '@domain/events/userCreated.event';
import { MultifactorProxyPort, MultifactorTypes } from '@domain/ports/multifactorProxy.port';

export class UserSendCodeEventServiceOnUserCreated
  implements DomainEventSubscriber<UserCreatedDomainEvent>
{
  constructor(private readonly multifactorProxyPort: MultifactorProxyPort) {}

  subscribedTo(): DomainEventClass[] {
    return [UserCreatedDomainEvent];
  }

  on({ aggregateId, data }: UserCreatedDomainEvent) {
    return this.multifactorProxyPort.sendEmail({
      userId: aggregateId,
      type: MultifactorTypes.EMAIL,
      email: data.email,
      subject: 'Email verification',
      message: `Hello ${data.names.split(' ')[0]}, your verification code is {{code}}`,
    });
  }
}
