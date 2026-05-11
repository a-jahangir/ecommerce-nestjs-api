import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAddressMig1000000000017 implements MigrationInterface {
  name: "CreateUserAddressMig1000000000017";
  transaction?: true;
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "user_address" 
        ("id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "postal_code" character varying NOT NULL,
        "country_id" UUID NOT NULL,
        "city" character varying NOT NULL,
        "street_address" character varying NOT NULL,
        "email" character varying NOT NULL,
        "house_number" character varying NOT NULL,
        "description" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_USER_ADDRESS" PRIMARY KEY ("id"))`
    );

    await queryRunner.query(`CREATE INDEX "IDX_USER_ADDRESS_USER_ID" ON "user_address" ("user_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_USER_ADDRESS_COUNTRY_ID" ON "user_address" ("country_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP INDEX "IDX_USER_ADDRESS_COUNTRY_ID"`);

    await queryRunner.query(`DROP INDEX "IDX_USER_ADDRESS_USER_ID"`);

    await queryRunner.query(`DROP TABLE "user_address"`);
  }
}
