import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from './http-server/app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig, CombinedConfigs } from './configs/configs.types';
import helmet from 'helmet';

import { useCommonFiltersAndPipes } from './http-server/use-common-filters-and-pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:4300'], // Placeholder: set correct domains for staging/prod
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  app.enableCors(corsOptions);

  app.enableShutdownHooks();

  app.use(helmet({ hidePoweredBy: true }));

  const config = app.get(ConfigService<CombinedConfigs>);
  const logger = app.get(Logger);

  const { appPort: port } = config.getOrThrow<AppConfig>('app');

  app.useLogger(logger);

  useCommonFiltersAndPipes(app);

  await app.listen(port);

  logger.log(`Starting server at ${await app.getUrl()}`);
}

void bootstrap();
