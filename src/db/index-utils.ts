import { AppDataSource } from '../data-source';

export async function dropIndexes() {
  await AppDataSource.query(`DROP INDEX IF EXISTS idx_order_created_at`);
  await AppDataSource.query(`DROP INDEX IF EXISTS idx_order_item_product`);
  await AppDataSource.query(`DROP INDEX IF EXISTS idx_order_item_order`);
}

export async function createIndexes() {
  await AppDataSource.query(`
    CREATE INDEX idx_order_created_at ON "order"(created_at);
  `);

  await AppDataSource.query(`
    CREATE INDEX idx_order_item_product ON order_item(product_id);
  `);

  await AppDataSource.query(`
    CREATE INDEX idx_order_item_order ON order_item(order_id);
  `);
}
