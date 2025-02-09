import { MiddyMiddleware } from '@common';

import { loadContainer } from './container';

const container = loadContainer(),
  middlewares = [container.cradle.contextMiddleware.use(), container.cradle.errorInterceptor.use()],
  controller = container.cradle.peopleController;

export const getById = MiddyMiddleware.use(controller.getById.bind(controller), middlewares);

export const search = MiddyMiddleware.use(controller.search.bind(controller), middlewares);

export const getSwapiAll = MiddyMiddleware.use(
  controller.getSwapiAll.bind(controller),
  middlewares
);

export const create = MiddyMiddleware.use(controller.create.bind(controller), middlewares);
