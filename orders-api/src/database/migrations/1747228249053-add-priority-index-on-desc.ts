import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriorityIndexOnDesc1747228249053 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMIT;`);
    await queryRunner.query(`
        CREATE INDEX CONCURRENTLY "idx_orders_priority_due" 
        ON "orders" ("country_priority", "payment_due_date");
    `);
    await queryRunner.query(`BEGIN;`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Cannot revert this migration');
  }
}
