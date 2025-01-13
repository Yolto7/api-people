import { APIGatewayProxyEvent } from 'aws-lambda';
import { MiddlewareObj } from '@middy/core';

import { RequestAsyncContext } from '../context';

export class ContextMiddleware {
  constructor() {}

  use(): MiddlewareObj<APIGatewayProxyEvent> {
    return {
      before: (handler) => {
        const context = this.extractAuthorizerContext(handler.event);

        !handler.event.queryStringParameters && (handler.event.queryStringParameters = {});

        Object.assign(handler.context, {
          requestAsyncContext: context,
        });
      },
    };
  }

  private extractAuthorizerContext(event: APIGatewayProxyEvent): RequestAsyncContext {
    if (!event.requestContext.authorizer?.token) {
      return {};
    }

    const context: RequestAsyncContext = {},
      token = event.requestContext.authorizer.token,
      jwtPayload = JSON.parse(event.requestContext.authorizer.jwtPayload);

    token && (context.token = token);

    jwtPayload &&
      (context.user = {
        id: jwtPayload.id,
        name: jwtPayload.name,
        document: jwtPayload.document,
        email: jwtPayload.email,
        role: jwtPayload.role,
        isActive: jwtPayload.isActive,
      });

    return context;
  }
}
