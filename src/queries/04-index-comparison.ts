import { AppDataSource } from '../data-source';
import { dropIndexes, createIndexes } from '../db/index-utils';
import { OrderItem } from '../entities/OrderItem';

(async () => {
  await AppDataSource.initialize();

  /* -------------------------------------------------
   * ❌ SIN ÍNDICES
   * ------------------------------------------------- */
  console.log('❌ Execution plan WITHOUT indexes');
  await dropIndexes();

  const noIndexPlan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT p.id, SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id;
  `);

  console.table(noIndexPlan);

  /* -------------------------------------------------
   * ❌ TypeORM QueryBuilder (sin índices)
   * ------------------------------------------------- */
  console.log('❌ TypeORM query WITHOUT indexes');

  const qbNoIndex = AppDataSource.getRepository(OrderItem)
    .createQueryBuilder('oi')
    .innerJoin('oi.product', 'p')
    .innerJoin('oi.order', 'o')
    .select('p.id', 'product_id')
    .addSelect('SUM(oi.quantity)', 'total_sold')
    .where(`o.created_at >= NOW() - INTERVAL '1 month'`)
    .groupBy('p.id');

  // 🔍 SQL generado por TypeORM
  console.log('Generated SQL (no indexes):');
  console.log(qbNoIndex.getSql());

  const planFromORMNoIndex = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    ${qbNoIndex.getSql()}
  `);

  console.table(planFromORMNoIndex);

  /* -------------------------------------------------
   * ✅ CON ÍNDICES
   * ------------------------------------------------- */
  console.log('✅ Execution plan WITH indexes');
  await createIndexes();

  const withIndexPlan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT p.id, SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id;
  `);

  console.table(withIndexPlan);

  /* -------------------------------------------------
   * ✅ TypeORM QueryBuilder (con índices)
   * ------------------------------------------------- */
  console.log('✅ TypeORM query WITH indexes');

  const qbWithIndex = AppDataSource.getRepository(OrderItem)
    .createQueryBuilder('oi')
    .innerJoin('oi.product', 'p')
    .innerJoin('oi.order', 'o')
    .select('p.id', 'product_id')
    .addSelect('SUM(oi.quantity)', 'total_sold')
    .where(`o.created_at >= NOW() - INTERVAL '1 month'`)
    .groupBy('p.id');

  console.log('Generated SQL (with indexes):');
  console.log(qbWithIndex.getSql());

  const planFromORMWithIndex = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    ${qbWithIndex.getSql()}
  `);

  console.table(planFromORMWithIndex);

  await AppDataSource.destroy();
})();
