import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcryptjs";

export class seedAdmin1000000000003 implements MigrationInterface {
  name?: "seedAdmin1000000000003";
  transaction?: true;

  public async up(queryRunner: QueryRunner): Promise<any> {
    const username = process.env.APP_SUPER_ADMIN_USERNAME;
    const password = process.env.APP_SUPER_ADMIN_PASSWORD;
    if (!username || !password) {
      throw new Error("Admin username or password is not set in environment variables.");
    }

    const existingAdmin = await queryRunner.query(`SELECT * FROM "admin" WHERE "email" = $1`, [username]);

    if (existingAdmin.length > 0) {
      console.log("Admin already exists. Skipping insertion.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await queryRunner.query(
      `INSERT INTO "admin" ("email","hash_password","created_at","updated_at","deleted_at") VALUES ($1, $2, NOW(), NOW(),null)`,
      [username, hashedPassword]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    const username = process.env.APP_SUPER_ADMIN_USERNAME;
    if (!username) {
      throw new Error("Admin username is not set in environment variables.");
    }
    await queryRunner.query(`DELETE FROM "admin" WHERE "username" = $1`, [username]);
  }
}
