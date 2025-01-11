import { CUIDA_CONTANST } from '../../domain/constants';
import { RequestAsyncContext, UserAuthInfo, AsyncContext } from '../context';

export class UserAuthProvider {
  get(): UserAuthInfo {
    const traceContext = AsyncContext.get<RequestAsyncContext>(CUIDA_CONTANST.ASYNCCONTEXT.REQUEST);

    return traceContext?.user as UserAuthInfo;
  }
}
