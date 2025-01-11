import { CUIDA_CONTANST } from '../../domain/constants';
import { SysTokenAsyncContext, AsyncContext } from '../context';

export class SysTokenProvider {
  get(): SysTokenAsyncContext {
    return AsyncContext.get<SysTokenAsyncContext>(
      CUIDA_CONTANST.ASYNCCONTEXT.SYS_TOKEN
    ) as SysTokenAsyncContext;
  }
}
