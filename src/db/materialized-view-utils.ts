import { AppDataSource } from '../data-source';

export async function refreshMaterializedView() {
  await AppDataSource.query(`
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_sales_last_month;
  `);
}
