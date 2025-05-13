import { PostgresErrorFilter } from '@/utils/filters/postgres-error/postgres-error.filter';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export function useCommonFiltersAndPipes(app: INestApplication) {
  app.useGlobalFilters(new PostgresErrorFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}
