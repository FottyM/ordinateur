import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './http-server/app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig, CombinedConfigs } from './configs/configs.types';
import helmet from 'helmet';
import { PostgresErrorFilter } from './utils/filters/postgres-error/postgres-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  app.enableCors();

  app.enableShutdownHooks();

  app.use(helmet({ hidePoweredBy: true }));

  const config = app.get(ConfigService<CombinedConfigs>);
  const logger = app.get(Logger);

  const { appPort: port } = config.getOrThrow<AppConfig>('app');

  app.useLogger(logger);
  app.useGlobalFilters(new PostgresErrorFilter());

  await app.listen(port);

  logger.log(`Starting server at ${await app.getUrl()}`);
}

void bootstrap();
