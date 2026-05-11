import { MigrationInterface, QueryRunner } from "typeorm";

export class orderAndOrderDetailsMig1000000000018 implements MigrationInterface {
  name?: "orderAndOrderDetailsMig1000000000018";
  transaction?: true;

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      CREATE TABLE "order" (
        "id" SERIAL NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "discount" character varying,
        "orderNumber" character varying,
        "shipment_url" character varying,
        "user_id" UUID NOT NULL,
        "status" character varying,
        "user_address" VARCHAR(255),
        "user_email" VARCHAR(255),
        "user_number" VARCHAR(255),
        "user_country"  VARCHAR(255),
        "user_postalcode" VARCHAR(255),
        "user_first_name"  VARCHAR(255),
        "user_last_name"  VARCHAR(255),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "paid_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_ORDER_ID" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "order_details" (
        "id" SERIAL NOT NULL,
        "order_id" integer NOT NULL,
        "variant_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "storage" VARCHAR(255) NOT NULL,
        "condition" VARCHAR(255) NOT NULL,
        "filePath" VARCHAR(255),
        "altText" VARCHAR(255),
        "color" VARCHAR(255),
        "SKU" VARCHAR(100) NOT NULL,
        "hasChargingCable" BOOLEAN NOT NULL DEFAULT false,
        "hasAdapter" BOOLEAN NOT NULL DEFAULT false,
        "hasAirPod" BOOLEAN NOT NULL DEFAULT false,
        "hasSIMTray" BOOLEAN NOT NULL DEFAULT false,
        "primary" BOOLEAN NOT NULL DEFAULT false,
        "basePrice" DECIMAL(10,2) NOT NULL,
        "brandNewPrice" DECIMAL(10,2),
        "discount" DECIMAL(5,2),
        CONSTRAINT "PK_ORDER_DETAILS_ID" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "order_details"`);
    await queryRunner.query(`DROP TABLE "order"`);
  }
}
