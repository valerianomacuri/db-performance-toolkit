import { AppDataSource } from '../data-source';
import { refreshMaterializedView } from '../db/materialized-view-utils';

(async () => {
  await AppDataSource.initialize();

  console.log('❌ Heavy query execution plan');

  const heavyPlan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT p.id, SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id;
  `);

  console.table(heavyPlan);

  console.log('🔄 Refreshing materialized view');
  await refreshMaterializedView();

  console.log('✅ Materialized view execution plan');

  const viewPlan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT product_id, total_sold
    FROM product_sales_last_month;
  `);

  console.table(viewPlan);

  const topProducts = await AppDataSource.query(`
    SELECT
      product_id,
      product_name,
      total_sold
    FROM product_sales_last_month
    ORDER BY total_sold DESC
    LIMIT 10;
  `);

  console.log('Top products (materialized view):', topProducts);

  await AppDataSource.destroy();
})();
