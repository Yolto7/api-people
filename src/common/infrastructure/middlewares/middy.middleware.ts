import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import middy, { MiddlewareObj } from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import httpCors from '@middy/http-cors';

import { AsyncContext, RequestAsyncContext, SysTokenAsyncContext } from '../context';
import { CUIDA_CONTANST } from '../../domain/constants';

export interface MiddyLambdaContext extends Context {
  requestAsyncContext: RequestAsyncContext;
  sysTokenAsyncContext: SysTokenAsyncContext;
}

export type Handler = (event: APIGatewayProxyEvent) => Promise<unknown>;

export class MiddyMiddleware {
  constructor() {}

  static use(handler: Handler, middlewares: MiddlewareObj<any>[] = []) {
    return middy((event: APIGatewayProxyEvent, context: MiddyLambdaContext) => {
      AsyncContext.set(CUIDA_CONTANST.ASYNCCONTEXT.REQUEST, context.requestAsyncContext);
      AsyncContext.set(CUIDA_CONTANST.ASYNCCONTEXT.SYS_TOKEN, context.sysTokenAsyncContext);

      return handler(event);
    }).use([
      httpCors(),
      httpHeaderNormalizer({
        defaultHeaders: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }),
      httpSecurityHeaders({
        strictTransportSecurity: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        contentSecurityPolicy: {
          defaultSrc: 'self',
          scriptSrc: 'self',
          styleSrc: 'self',
          imgSrc: 'self',
          frameAncestors: 'self',
        },
      }),
      // this.tlsCheckMiddleware(),
      jsonBodyParser(),
      ...middlewares,
    ]);
  }

  /* private static tlsCheckMiddleware(): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> {
    return {
      before: (handler) => {
        const protocol = handler.event.requestContext.protocol;
        if (!protocol || !protocol.includes('TLS') || !protocol.includes('1.2')) {
          throw new AppError(ErrorTypes.FORBIDDEN, 'TLS 1.2 is required', 'ERR_TLS_1.2_REQUIRED');
        }
      },
    };
  } */
}
