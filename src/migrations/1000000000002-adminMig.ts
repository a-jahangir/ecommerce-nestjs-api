import { MigrationInterface, QueryRunner } from 'typeorm';

export class adminMig1000000000002 implements MigrationInterface {
  name?: 'adminMig1000000000002';
  transaction?: true;

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "admin" 
        ("id" UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "hash_password" character varying NOT NULL, 
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), 
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_ADMIN" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "admin"`);
  }
}
