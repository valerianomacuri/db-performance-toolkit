import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductSalesMaterializedView1765901217761
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW product_sales_last_month AS
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        SUM(oi.quantity) AS total_sold
      FROM product p
      JOIN order_item oi ON oi.product_id = p.id
      JOIN "order" o ON o.id = oi.order_id
      WHERE o.created_at >= NOW() - INTERVAL '1 month'
      GROUP BY p.id, p.name;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_pslm_product_id
      ON product_sales_last_month(product_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS product_sales_last_month;
    `);
  }
}
