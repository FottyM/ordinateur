import { DataSource, DataSourceOptions, LogLevel } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL!,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../**/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING
    ? (process.env.DB_LOGGING.split(',') as LogLevel[])
    : isProduction
      ? ['error']
      : ['query', 'error'],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  extra: {
    max: parseInt(
      process.env.DB_MAX_CONNECTIONS ?? (isProduction ? '10' : '5'),
      10,
    ),
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
