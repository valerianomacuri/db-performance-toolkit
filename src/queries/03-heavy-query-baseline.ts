import { AppDataSource } from '../data-source';

(async () => {
  await AppDataSource.initialize();

  const plan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT p.id, SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id;
  `);

  console.log('Execution plan (heavy query - no indexes):');
  console.table(plan);

  await AppDataSource.destroy();
})();
