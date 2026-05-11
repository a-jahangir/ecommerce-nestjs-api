import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductMig1000000000016 implements MigrationInterface {
  name = "ProductMig1000000000016";
  transaction?: true;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "brand" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" VARCHAR(255) NOT NULL
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "color" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" VARCHAR(255) NOT NULL
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "model" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "category" VARCHAR(255) NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "brandId" INTEGER
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "model"
            ADD CONSTRAINT "FK_model_brand"
            FOREIGN KEY ("brandId") REFERENCES "brand"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_model_brandId" ON "model" ("brandId")
        `);

    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "category" VARCHAR(255) NOT NULL,
                "releaseDate" DATE,
                "name" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "metaTitle" VARCHAR(255),
                "metaDescription" VARCHAR(255),
                "visibleOnStore" BOOLEAN NOT NULL DEFAULT false,
                "recommended" BOOLEAN NOT NULL DEFAULT false,
                "brandId" INTEGER,
                "modelId" INTEGER
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "product_specification" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" VARCHAR(255) NOT NULL,
                "productId" INTEGER
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "specification_attribute" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" VARCHAR(255) NOT NULL,
                "value" VARCHAR(255) NOT NULL,
                "productSpecificationId" INTEGER
            )
        `);

    // Create product_tag table
    await queryRunner.query(`
            CREATE TABLE "product_tag" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "value" VARCHAR(255) NOT NULL,
                "productId" INTEGER
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "product_image" (
            "id" SERIAL NOT NULL PRIMARY KEY,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            "filePath" VARCHAR(255),
            "index" DECIMAL(10,2),
            "productId" INTEGER
            )
        `);

    // Create product_variant table
    await queryRunner.query(`
            CREATE TABLE "product_variant" (
                "id" SERIAL NOT NULL PRIMARY KEY,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "storage" VARCHAR(255) NOT NULL,
                "condition" VARCHAR(255) NOT NULL,
                "filePath" VARCHAR(255),
                "altText" VARCHAR(255),
                "color" VARCHAR(255),
                "SKU" VARCHAR(100) NOT NULL,
                "quantity" INTEGER NOT NULL DEFAULT 0,
                "hasChargingCable" BOOLEAN NOT NULL DEFAULT false,
                "hasAdapter" BOOLEAN NOT NULL DEFAULT false,
                "hasAirPod" BOOLEAN NOT NULL DEFAULT false,
                "hasSIMTray" BOOLEAN NOT NULL DEFAULT false,
                "primary" BOOLEAN NOT NULL DEFAULT false,
                "basePrice" DECIMAL(10,2) NOT NULL,
                "brandNewPrice" DECIMAL(10,2),
                "discount" DECIMAL(5,2),
                "productId" INTEGER
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_product_brand" 
            FOREIGN KEY ("brandId") REFERENCES "brand"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "product" 
            ADD CONSTRAINT "FK_product_model" 
            FOREIGN KEY ("modelId") REFERENCES "model"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "product_specification" 
            ADD CONSTRAINT "FK_product_specification_product" 
            FOREIGN KEY ("productId") REFERENCES "product"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "product_image" 
            ADD CONSTRAINT "FK_product_image_product" 
            FOREIGN KEY ("productId") REFERENCES "product"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "specification_attribute" 
            ADD CONSTRAINT "FK_specification_attribute_product_specification" 
            FOREIGN KEY ("productSpecificationId") REFERENCES "product_specification"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "product_tag" 
            ADD CONSTRAINT "FK_product_tag_product" 
            FOREIGN KEY ("productId") REFERENCES "product"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "product_variant" 
            ADD CONSTRAINT "FK_product_variant_product" 
            FOREIGN KEY ("productId") REFERENCES "product"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_brand"`);
    await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_model"`);
    await queryRunner.query(`ALTER TABLE "product_specification" DROP CONSTRAINT "FK_product_specification_product"`);
    await queryRunner.query(
      `ALTER TABLE "specification_attribute" DROP CONSTRAINT "FK_specification_attribute_product_specification"`
    );
    await queryRunner.query(`ALTER TABLE "product_tag" DROP CONSTRAINT "FK_product_tag_product"`);
    await queryRunner.query(`ALTER TABLE "product_variant" DROP CONSTRAINT "FK_product_variant_product"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "product_variant"`);
    await queryRunner.query(`DROP TABLE "product_tag"`);
    await queryRunner.query(`DROP TABLE "specification_attribute"`);
    await queryRunner.query(`DROP TABLE "product_specification"`);
    await queryRunner.query(`DROP TABLE "product"`);

    // Drop foreign key constraint first
    await queryRunner.query(`
            ALTER TABLE "model" DROP CONSTRAINT "FK_model_brand"
        `);

    // Drop index
    await queryRunner.query(`
            DROP INDEX "public"."IDX_model_brandId"
        `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "model"`);
    await queryRunner.query(`DROP TABLE "brand"`);
  }
}
