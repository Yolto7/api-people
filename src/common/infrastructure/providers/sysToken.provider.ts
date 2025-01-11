import { cuida_CONSTANTS } from '../../domain/constants';
import { SysTokenAsyncContext, AsyncContext } from '../context';

export class SysTokenProvider {
  get(): SysTokenAsyncContext {
    return AsyncContext.get<SysTokenAsyncContext>(
      cuida_CONSTANTS.ASYNCCONTEXT.SYS_TOKEN
    ) as SysTokenAsyncContext;
  }
}
