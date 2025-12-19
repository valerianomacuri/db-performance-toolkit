import { AppDataSource } from '../data-source';
import { Order } from '../entities/Order';

(async () => {
  await AppDataSource.initialize();

  const orders = await AppDataSource.getRepository(Order)
    .createQueryBuilder('o')
    .select(['o.id', 'o.total'])
    .where('o.user_id = :id', { id: 1 })
    .limit(10)
    .getMany();

  const plan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT o.id, o.total
    FROM "order" o
    WHERE o.user_id = 1
    LIMIT 10;
  `);

  console.log('Execution plan (controlled joins):');
  console.table(plan);
  console.log('Orders:', orders);

  await AppDataSource.destroy();
})();
