import { createContainer, InjectionMode, asValue, AwilixContainer, asClass } from 'awilix';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import {
  Logger,
  WinstonLogger,
  UserAuthProvider,
  DynamoClientFactory,
  ErrorInterceptor,
  EventBridgeEventBus,
  EventMiddleware,
  ContextMiddleware,
  SysTokenProvider,
  SysTokenMiddleware,
  DynamoDbCriteriaConverter,
} from '@common';

import { Config, config } from '@config';
import { UserCreateCommandService } from '@application/services/commands/user-create.command.service';
import { UserUpdateCommandService } from '@application/services/commands/user-update.command.service';
import { UserPhotoUploadCommandService } from '@application/services/commands/userPhoto-upload.command.service';
import { UserQueriesService } from '@application/services/queries/user.query.service';
import { UserDomainService } from '@domain/services/user.domain.service';
import { BucketAdapter } from '@infrastructure/adapters/bucket.adapter';
import { UserDynamoDbRepository } from '@infrastructure/repositories/user-dynamodb.repository';
import UserPrivateController from '@presentation/private/controllers/user.controller';
import UserPublicController from '@presentation/public/controllers/user.controller';
import { UserVerifyCommandService } from '@application/services/commands/user-verifyCode.command.service';
import { MultifactorProxyAdapter } from '@infrastructure/adapters/multifactorProxy-axios.adapter';
import { UserResendCodeCommandService } from '@application/services/commands/user-resendCode.command.service';
import { RekognitionAdapter } from '@infrastructure/adapters/rekognition.adapter';
import { UserPhotoCompareCommandService } from '@application/services/commands/userPhoto-compare.command.service';
import { UserSendCodeEventServiceOnUserCreated } from '@application/services/events/user-sendCode.event.service';
import { AccessProxyAdapter } from '@infrastructure/adapters/accessProxy-axios.adapter';
import { OnboardingProxyAdapter } from '@infrastructure/adapters/onboardingProxy-axios.adapter';
import { AccessCreateEventServiceOnUserVerified } from '@application/services/events/access-create.event.service';
import { SnsAdapter } from '@infrastructure/adapters/sns.adapter';

export interface Cradle {
  config: Config;
  dynamoDb: DynamoDBClient;
  logger: Logger;

  contextMiddleware: ContextMiddleware;
  errorInterceptor: ErrorInterceptor;
  eventMiddleware: EventMiddleware;
  sysTokenMiddleware: SysTokenMiddleware;

  sysTokenProvider: SysTokenProvider;
  userAuthProvider: UserAuthProvider;

  dynamoDbCriteriaConverter: DynamoDbCriteriaConverter;

  userDynamoDbRepository: UserDynamoDbRepository;

  userDomainService: UserDomainService;

  userQueriesService: UserQueriesService;

  userCreateCommandService: UserCreateCommandService;
  userUpdateCommandService: UserUpdateCommandService;
  userPhotoUploadCommandService: UserPhotoUploadCommandService;
  userPhotoCompareCommandService: UserPhotoCompareCommandService;
  userResendCodeCommandService: UserResendCodeCommandService;
  userVerifyCommandService: UserVerifyCommandService;

  userSendCodeEventServiceOnUserCreated: UserSendCodeEventServiceOnUserCreated;
  accessCreateEventServiceOnUserVerified: AccessCreateEventServiceOnUserVerified;

  accessProxyAdapter: AccessProxyAdapter;
  bucketAdapter: BucketAdapter;
  multifactorProxyAdapter: MultifactorProxyAdapter;
  onboardingProxyAdapter: OnboardingProxyAdapter;
  rekognitionAdapter: RekognitionAdapter;
  snsAdapter: SnsAdapter;

  eventBridgeEventBus: EventBridgeEventBus;

  userPrivateController: UserPrivateController;
  userPublicController: UserPublicController;
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
    dynamoDbCriteriaConverter: asClass(DynamoDbCriteriaConverter).singleton(),

    // Repositories
    userDynamoDbRepository: asClass(UserDynamoDbRepository).scoped(),

    // Domain Services
    userDomainService: asClass(UserDomainService)
      .inject((container: AwilixContainer) => ({
        userRepository: container.cradle.userDynamoDbRepository,
      }))
      .scoped(),

    // Application Queries Services
    userQueriesService: asClass(UserQueriesService)
      .inject((container: AwilixContainer) => ({
        userRepository: container.cradle.userDynamoDbRepository,
      }))
      .scoped(),

    //Application Commands Services
    userCreateCommandService: asClass(UserCreateCommandService)
      .inject((container: AwilixContainer) => ({
        userRepository: container.cradle.userDynamoDbRepository,
        eventBus: container.cradle.eventBridgeEventBus,
      }))
      .scoped(),
    userUpdateCommandService: asClass(UserUpdateCommandService)
      .inject((container: AwilixContainer) => ({
        userRepository: container.cradle.userDynamoDbRepository,
        snsPort: container.cradle.snsAdapter,
      }))
      .scoped(),
    userPhotoUploadCommandService: asClass(UserPhotoUploadCommandService)
      .inject((container: AwilixContainer) => ({
        bucketPort: container.cradle.bucketAdapter,
        rekognitionPort: container.cradle.rekognitionAdapter,
      }))
      .scoped(),
    userPhotoCompareCommandService: asClass(UserPhotoCompareCommandService)
      .inject((container: AwilixContainer) => ({
        bucketPort: container.cradle.bucketAdapter,
        rekognitionPort: container.cradle.rekognitionAdapter,
      }))
      .scoped(),
    userResendCodeCommandService: asClass(UserResendCodeCommandService)
      .inject((container: AwilixContainer) => ({
        multifactorProxyPort: container.cradle.multifactorProxyAdapter,
      }))
      .scoped(),
    userVerifyCommandService: asClass(UserVerifyCommandService)
      .inject((container: AwilixContainer) => ({
        multifactorProxyPort: container.cradle.multifactorProxyAdapter,
        eventBus: container.cradle.eventBridgeEventBus,
      }))
      .scoped(),

    // Application Events Services
    userSendCodeEventServiceOnUserCreated: asClass(UserSendCodeEventServiceOnUserCreated)
      .inject((container: AwilixContainer) => ({
        multifactorProxyPort: container.cradle.multifactorProxyAdapter,
      }))
      .scoped(),
    accessCreateEventServiceOnUserVerified: asClass(AccessCreateEventServiceOnUserVerified)
      .inject((container: AwilixContainer) => ({
        accessProxyPort: container.cradle.accessProxyAdapter,
        onboardingProxyPort: container.cradle.onboardingProxyAdapter,
      }))
      .scoped(),

    // Infrastructure Adapters
    accessProxyAdapter: asClass(AccessProxyAdapter).singleton(),
    bucketAdapter: asClass(BucketAdapter).singleton(),
    multifactorProxyAdapter: asClass(MultifactorProxyAdapter).singleton(),
    onboardingProxyAdapter: asClass(OnboardingProxyAdapter).singleton(),
    rekognitionAdapter: asClass(RekognitionAdapter).singleton(),
    snsAdapter: asClass(SnsAdapter).singleton(),

    // Infrastructure Event Busses
    eventBridgeEventBus: asClass(EventBridgeEventBus)
      .inject((container: AwilixContainer) => ({
        config: {
          isDebug: container.cradle.config.isDebug,
          AWS_ACCESS_KEY_ID: container.cradle.config.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: container.cradle.config.AWS_SECRET_ACCESS_KEY,
          AWS_REGION_NAME: container.cradle.config.AWS_REGION_NAME,
          AWS_EVENT_BUS_NAME: container.cradle.config.USERS_EVENT_BUS_NAME,
        },
      }))
      .singleton(),

    // Presentation Controllers
    userPrivateController: asClass(UserPrivateController).scoped(),
    userPublicController: asClass(UserPublicController).scoped(),
  });

  container.register({
    // DynamoDB
    dynamoDb: asValue(
      DynamoClientFactory.getClient(
        {
          isDebug: container.cradle.config.isDebug,
          AWS_ACCESS_KEY_ID: container.cradle.config.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: container.cradle.config.AWS_SECRET_ACCESS_KEY,
          AWS_REGION_NAME: container.cradle.config.AWS_REGION_NAME,
        },
        container.cradle.logger
      )
    ),
  });

  return container;
};
