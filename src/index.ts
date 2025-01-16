import { MiddyMiddleware } from '@common';

import { loadContainer } from './container';

const container = loadContainer(),
  middlewares = [container.cradle.contextMiddleware.use(), container.cradle.errorInterceptor.use()],
  controller = container.cradle.peopleController;

export = {
  getById: MiddyMiddleware.use(controller.getById.bind(controller), middlewares),
  search: MiddyMiddleware.use(controller.search.bind(controller), middlewares),
  getSwapiAll: MiddyMiddleware.use(controller.getSwapiAll.bind(controller), middlewares),
  create: MiddyMiddleware.use(controller.create.bind(controller), middlewares),
};
