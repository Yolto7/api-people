import { ScheduledEvent } from 'aws-lambda';

import { CUIDA_CONTANST } from '../../domain/constants';
import { AsyncContext, RequestAsyncContext } from '../context';
import { Logger } from '../../domain/logger';
import { SysTokenMiddleware } from './sysToken.middleware';

type Handler<T> = (event: T) => Promise<void>;

export class EventMiddleware {
  constructor(
    private readonly logger: Logger,
    private readonly sysTokenMiddleware: SysTokenMiddleware
  ) {}

  use<T extends { context: RequestAsyncContext | undefined }>(handler: Handler<T>) {
    return async (event: ScheduledEvent<T>) => {
      this.logger.info(`event: ${JSON.stringify(event)}`);

      event.detail.context && (event.detail.context.token = undefined);
      AsyncContext.set(CUIDA_CONTANST.ASYNCCONTEXT.REQUEST, event.detail.context);
      AsyncContext.set(
        CUIDA_CONTANST.ASYNCCONTEXT.SYS_TOKEN,
        await this.sysTokenMiddleware.getSysToken()
      );

      return handler(event.detail);
    };
  }
}
