import axios, { AxiosInstance as Instance, RawAxiosRequestHeaders } from 'axios';

import { CUIDA_CONTANST } from '../../domain/constants';
import { AsyncContext, RequestAsyncContext } from '../context';

export type AxiosInstance = Instance;

export interface AxiosConfig {
  baseUrl: string;
  headers?: { Authorization?: string; 'Content-Type'?: string };
}

function getAxios(config: AxiosConfig) {
  const headers: RawAxiosRequestHeaders = {
    ...config.headers,
    Accept: 'application/json',
  };

  !headers['Content-Type'] && (headers['Content-Type'] = 'application/json');
  const client = axios.create({
    headers,
    baseURL: config.baseUrl,
  });

  client.interceptors.request.use(
    (request) => {
      const traceContext = AsyncContext.get<RequestAsyncContext>(
        CUIDA_CONTANST.ASYNCCONTEXT.REQUEST
      );
      if (!request.headers.Authorization && traceContext?.token) {
        request.headers.Authorization = `Bearer ${traceContext.token}`;
      }

      return request;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
}

export class AxiosClientFactory {
  private static instance: AxiosClientFactory;
  private client: AxiosInstance;

  private constructor(private readonly config: AxiosConfig) {
    this.client = getAxios(this.config);
  }

  static getInstance(config: AxiosConfig): AxiosInstance {
    if (!AxiosClientFactory.instance) {
      AxiosClientFactory.instance = new AxiosClientFactory(config);
    }

    return AxiosClientFactory.instance.client;
  }

  static getClient(config: AxiosConfig): AxiosInstance {
    return getAxios(config);
  }
}
