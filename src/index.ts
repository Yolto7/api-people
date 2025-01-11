
import { MiddyMiddleware } from '@common';

import { loadContainer } from './container';
import { UserCreatedDomainEvent } from '@domain/events/userCreated.event';
import { UserVerifiedDomainEvent } from '@domain/events/userVerified.event';

const container = loadContainer(),
  EventMiddleware = container.cradle.eventMiddleware,
  middlewares = [container.cradle.contextMiddleware.use(), container.cradle.errorInterceptor.use()],
  userPrivateController = container.cradle.userPrivateController,
  userPublicController = container.cradle.userPublicController;

export = {
  // PRIVATE
  getById: MiddyMiddleware.use(
    userPrivateController.getById.bind(userPrivateController),
    middlewares
  ),
  getByEmail: MiddyMiddleware.use(
    userPrivateController.getByEmail.bind(userPrivateController),
    middlewares
  ),
  update: MiddyMiddleware.use(
    userPrivateController.update.bind(userPrivateController),
    middlewares
  ),

  // PUBLIC
  create: MiddyMiddleware.use(userPublicController.create.bind(userPublicController), middlewares),

  // EVENTS
  sendCode: EventMiddleware.use<UserCreatedDomainEvent>(
    container.cradle.userSendCodeEventServiceOnUserCreated.on.bind(
      container.cradle.userSendCodeEventServiceOnUserCreated
    )
  ),
  createAccess: EventMiddleware.use<UserVerifiedDomainEvent>(
    container.cradle.accessCreateEventServiceOnUserVerified.on.bind(
      container.cradle.accessCreateEventServiceOnUserVerified
    )
  ),
};
