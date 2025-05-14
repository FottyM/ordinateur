import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFasterIndexes1747228137634 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await queryRunner.query(`SET statement_timeout TO 0;`);

    await queryRunner.query(`
        ALTER TABLE "orders"
        ADD COLUMN "country_priority" smallint GENERATED ALWAYS AS (
            CASE
                WHEN country = 'EE' THEN 0
                ELSE 1
            END
        ) STORED;
      `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Cannot revert this migration');
  }
}
