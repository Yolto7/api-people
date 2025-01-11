import dotenv from 'dotenv';

import { ConfigBase, CUIDA_CONTANST } from '@common';

dotenv.config();

export interface Config extends ConfigBase {
  PEOPLE_TABLE_NAME: string;

  SWAPI_API_BASE_URL: string;
}

const {
  NODE_ENV = CUIDA_CONTANST.ENVIRONMENTS.STG,

  DATABASE_HOST = '',
  DATABASE_PORT = 3306,
  DATABASE_USER = '',
  DATABASE_PASSWORD = '',
  DATABASE_NAME = '',

  AWS_REGION = '',

  PEOPLE_TABLE_NAME = '',

  SWAPI_API_BASE_URL = '',
} = process.env;

export const config: Config = {
  NODE_ENV,

  AWS_REGION,

  DATABASE_HOST,
  DATABASE_PORT: Number(DATABASE_PORT),
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,

  PEOPLE_TABLE_NAME,

  SWAPI_API_BASE_URL,

  isDebug: NODE_ENV === CUIDA_CONTANST.ENVIRONMENTS.DEBUG,
  isDevelopment: NODE_ENV === CUIDA_CONTANST.ENVIRONMENTS.DEV,
  isStaging: NODE_ENV === CUIDA_CONTANST.ENVIRONMENTS.STG,
  isProduction: NODE_ENV === CUIDA_CONTANST.ENVIRONMENTS.PROD,
};
