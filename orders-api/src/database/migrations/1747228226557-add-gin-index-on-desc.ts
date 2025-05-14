import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGinIndexOnDesc1747228226557 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMIT;`);

    await queryRunner.query(`
        CREATE INDEX CONCURRENTLY "idx_orders_desc_trgm"
        ON "orders" USING gin ("payment_description" gin_trgm_ops);
    `);

    await queryRunner.query(`BEGIN;`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Cannot revert this migration');
  }
}
