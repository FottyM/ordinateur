import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './configs.types';
import validateConfig from '@/utils/validate-configs';
import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { LogLevel } from 'typeorm';

class DatabaseEnvVarsValidator {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsInt()
  @IsOptional()
  DB_MAX_CONNECTIONS: number;

  @IsString()
  @IsOptional()
  DB_LOGGING: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, DatabaseEnvVarsValidator);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL!,
    synchronize: false,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrations: [__dirname + '/../**/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
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
});
