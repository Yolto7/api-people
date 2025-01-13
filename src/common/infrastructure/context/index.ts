import { AsyncLocalStorage } from 'async_hooks';
import { UniqueId } from '../../domain/entity/uniqueEntityId';

export interface UserAuthInfo {
  id: UniqueId;
  name: string;
  document: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface RequestAsyncContext {
  token?: string;
  refreshToken?: string;
  user?: UserAuthInfo;
}

export interface SysTokenAsyncContext {
  accessToken: string;
  refreshToken: string;
}

export class AsyncContext {
  private static storeContext = new AsyncLocalStorage();

  static get<T>(name: string): T | undefined {
    return (this.storeContext.getStore() as Map<string, T>)?.get(name);
  }

  static set(name: string, value: unknown) {
    const store = this.storeContext.getStore() as Map<string, unknown>;
    store ? store.set(name, value) : this.storeContext.enterWith(new Map([[name, value]]));
  }
}
