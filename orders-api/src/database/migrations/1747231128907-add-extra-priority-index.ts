import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtraPriorityIndex1747231128907 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMIT;`);
    await queryRunner.query(`
            CREATE INDEX CONCURRENTLY idx_order_priority_due
            ON orders (country_priority, payment_due_date);
        `);

    await queryRunner.query(`BEGIN;`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Not going back');
  }
}
