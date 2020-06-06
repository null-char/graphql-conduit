import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderedIndexToArticle1591426167713
  implements MigrationInterface {
  name = 'AddOrderedIndexToArticle1591426167713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX "created_at_desc" ON "article" ("createdAt" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "created_at_desc"');
  }
}
