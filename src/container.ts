import { createContainer, InjectionMode, asValue, AwilixContainer, asClass } from 'awilix';
import { Pool } from 'mysql2/promise';

import {
  Logger,
  WinstonLogger,
  UserAuthProvider,
  ErrorInterceptor,
  EventMiddleware,
  ContextMiddleware,
  SysTokenProvider,
  SysTokenMiddleware,
  MysqlCriteriaConverter,
  MysqlClientFactory,
} from '@common';

import { Config, config } from '@config';
import { PeopleCreateCommandService } from '@application/services/commands/people-create.command.service';
import { PeopleQueriesService } from '@application/services/queries/people.query.service';
import { PeopleDomainService } from '@domain/services/people.domain.service';
import { SwapiProxyAdapter } from '@infrastructure/adapters/swapiProxy-axios.adapter';
import { PeopleMysqlRepository } from '@infrastructure/repositories/people-mysql.repository';
import { PeopleController } from '@presentation/controllers/people.controller';

export interface Cradle {
  config: Config;
  db: Pool;
  logger: Logger;

  contextMiddleware: ContextMiddleware;
  errorInterceptor: ErrorInterceptor;
  eventMiddleware: EventMiddleware;
  sysTokenMiddleware: SysTokenMiddleware;

  sysTokenProvider: SysTokenProvider;
  userAuthProvider: UserAuthProvider;

  mysqlCriteriaConverter: MysqlCriteriaConverter;

  peopleMysqlRepository: PeopleMysqlRepository;

  peopleDomainService: PeopleDomainService;

  peopleQueriesService: PeopleQueriesService;

  peopleCreateCommandService: PeopleCreateCommandService;

  swapiProxyAdapter: SwapiProxyAdapter;

  peopleController: PeopleController;
}

export const loadContainer = (): AwilixContainer<Cradle> => {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    // Config
    config: asValue(config),

    // Logger
    logger: asClass(WinstonLogger)
      .inject((container: AwilixContainer) => ({
        isDebug: container.cradle.config.isDebug,
      }))
      .singleton(),

    // Middlewares
    contextMiddleware: asClass(ContextMiddleware).singleton(),
    errorInterceptor: asClass(ErrorInterceptor).singleton(),
    eventMiddleware: asClass(EventMiddleware).singleton(),
    sysTokenMiddleware: asClass(SysTokenMiddleware).singleton(),

    // Providers
    sysTokenProvider: asClass(SysTokenProvider).singleton(),
    userAuthProvider: asClass(UserAuthProvider).singleton(),

    // Criteria
    mysqlCriteriaConverter: asClass(MysqlCriteriaConverter).singleton(),

    // Repositories
    peopleMysqlRepository: asClass(PeopleMysqlRepository).scoped(),

    // Domain Services
    peopleDomainService: asClass(PeopleDomainService)
      .inject((container: AwilixContainer) => ({
        peopleRepository: container.cradle.peopleMysqlRepository,
      }))
      .scoped(),

    // Application Services
    peopleQueriesService: asClass(PeopleQueriesService)
      .inject((container: AwilixContainer) => ({
        peopleRepository: container.cradle.peopleMysqlRepository,
        swapiProxyPort: container.cradle.swapiProxyAdapter,
      }))
      .scoped(),

    peopleCreateCommandService: asClass(PeopleCreateCommandService)
      .inject((container: AwilixContainer) => ({
        peopleRepository: container.cradle.peopleMysqlRepository,
      }))
      .scoped(),

    // Infrastructure Adapters
    swapiProxyAdapter: asClass(SwapiProxyAdapter).transient(),

    // Presentation Controllers
    peopleController: asClass(PeopleController).scoped(),
  });

  container.register({
    // Database
    db: asValue(
      MysqlClientFactory.getClient(
        {
          DATABASE_HOST: container.cradle.config.DATABASE_HOST,
          DATABASE_PORT: container.cradle.config.DATABASE_PORT,
          DATABASE_USER: container.cradle.config.DATABASE_USER,
          DATABASE_PASSWORD: container.cradle.config.DATABASE_PASSWORD,
          DATABASE_NAME: container.cradle.config.DATABASE_NAME,
        },
        container.cradle.logger
      )
    ),
  });

  return container;
};
