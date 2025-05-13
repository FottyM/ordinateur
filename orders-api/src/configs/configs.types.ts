import { Params } from 'nestjs-pino';

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export type DatabaseConfig = PostgresConnectionOptions;

export type AppConfig = {
  appPort: number;
  isProduction: boolean;
};

export type CombinedConfigs = {
  app: AppConfig;
  database: DatabaseConfig;
  logger: Params;
};
