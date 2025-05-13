import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderWithFixedTs1747135333547 implements MigrationInterface {
  name = 'AddOrderWithFixedTs1747135333547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "public_id" text NOT NULL,
        "order_number" text NOT NULL,
        "payment_description" text NOT NULL,
        "street_address" text NOT NULL,
        "town" text NOT NULL,
        "country" text NOT NULL,
        "currency" text NOT NULL,
        "amount" integer NOT NULL,
        "payment_due_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "create_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_orders" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_orders_public_id_unique" ON "orders" ("public_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_orders_order_number_unique" ON "orders" ("order_number") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_orders_order_number_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_orders_public_id_unique"`,
    );
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
