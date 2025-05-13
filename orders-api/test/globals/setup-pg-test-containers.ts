import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'node:child_process';

let teardownHappened = false;

export async function setup() {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DB_PORT } =
    process.env;

  if (!POSTGRES_DB || !POSTGRES_PASSWORD || !POSTGRES_USER || !DB_PORT) {
    throw new Error(
      'Missing required environment variables for Postgres test container',
    );
  }

  const postgresContainer = await new PostgreSqlContainer('postgres:16')
    .withExposedPorts({ container: 5432, host: Number(DB_PORT) })
    .withDatabase(POSTGRES_DB)
    .withPassword(POSTGRES_PASSWORD)
    .withUsername(POSTGRES_USER)
    .withName('test_postgres')
    .withReuse()
    .withHealthCheck({
      test: ['CMD-SHELL', `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`],
      interval: 1000 * 5,
      timeout: 1000 * 60 * 3,
      retries: 100,
      startPeriod: 1000 * 30,
    })
    .start();

  execSync('npm run migration:run', { stdio: 'inherit' });

  return async () => {
    if (teardownHappened) {
      throw new Error('postgres teardown called twice');
    }
    teardownHappened = true;
    await postgresContainer.stop();
  };
}
