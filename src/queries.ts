import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Order } from './entities/Order';
import { Product } from './entities/Product';
import { OrderItem } from './entities/OrderItem';

export async function runQueries() {
  await AppDataSource.initialize();
  console.log('Database connected for queries!');

  const userRepo = AppDataSource.getRepository(User);
  const orderRepo = AppDataSource.getRepository(Order);

  /* -------------------------------------------------
   * 1️⃣ WHERE exacto (alineado al seed)
   * ------------------------------------------------- */
  const userEmail = 'user1@test.com';

  const user = await userRepo.findOne({
    where: { email: userEmail },
    select: ['id', 'name', 'email'], // 👈 no traer basura
  });

  console.log('User found:', user);

  if (!user) return;

  /* -------------------------------------------------
   * 2️⃣ Queries con joins CONTROLADOS (no relations)
   * ------------------------------------------------- */
  const orders = await orderRepo
    .createQueryBuilder('o')
    .select(['o.id', 'o.status', 'o.total', 'o.created_at'])
    .where('o.user_id = :userId', { userId: user.id })
    .limit(10)
    .getMany();

  console.log('Orders for user:', orders);

  /* -------------------------------------------------
   * 3️⃣ Query pesada (100k items) – reporte real
   * ------------------------------------------------- */
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const sales = await AppDataSource.query(
    `
    SELECT
      p.id,
      p.name,
      SUM(oi.quantity) AS total_sold
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= $1
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
    LIMIT 10
  `,
    [lastMonth],
  );

  console.log('Top products last month:', sales);

  /* -------------------------------------------------
   * 4️⃣ Execution Plan (ANTES de índices)
   * ------------------------------------------------- */
  const explain = await AppDataSource.query(`
    EXPLAIN ANALYZE
    SELECT
      p.id,
      SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id
  `);

  console.log('Execution plan (no indexes):');
  console.table(explain);

  /* -------------------------------------------------
   * 5️⃣ Índices (hechos una sola vez normalmente)
   * ------------------------------------------------- */
  await AppDataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_order_created_at
    ON "order"(created_at);
  `);

  await AppDataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_order_item_product
    ON order_item(product_id);
  `);

  await AppDataSource.query(`
    CREATE INDEX IF NOT EXISTS idx_order_item_order
    ON order_item(order_id);
  `);

  console.log('Indexes ensured');

  /* -------------------------------------------------
   * 6️⃣ Execution Plan (DESPUÉS de índices)
   * ------------------------------------------------- */
  const explainAfter = await AppDataSource.query(`
    EXPLAIN ANALYZE
    SELECT
      p.id,
      SUM(oi.quantity)
    FROM product p
    JOIN order_item oi ON oi.product_id = p.id
    JOIN "order" o ON o.id = oi.order_id
    WHERE o.created_at >= NOW() - INTERVAL '1 month'
    GROUP BY p.id
  `);

  console.log('Execution plan (with indexes):');
  console.table(explainAfter);

  /* -------------------------------------------------
   * 7️⃣ Leer vista materializada (si existe)
   * ------------------------------------------------- */
  try {
    const viewData = await AppDataSource.query(`
      SELECT *
      FROM product_sales_last_month
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    console.log('Materialized view data:', viewData);
  } catch {
    console.warn('Materialized view not found. Create it via migration.');
  }
}
