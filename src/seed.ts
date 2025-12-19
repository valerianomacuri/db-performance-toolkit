import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Product } from './entities/Product';
import { Order } from './entities/Order';
import { OrderItem } from './entities/OrderItem';

const USERS_COUNT = 100;
const PRODUCTS_COUNT = 100;
const ORDERS_COUNT = 5_000;
const ORDER_ITEMS_COUNT = 100_000;
const BATCH_SIZE = 1_000;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await AppDataSource.initialize();
  console.log('DB connected');

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);
  const orderRepo = AppDataSource.getRepository(Order);
  const itemRepo = AppDataSource.getRepository(OrderItem);

  /** -----------------------------
   * USERS
   * ----------------------------- */
  const users: User[] = [];
  for (let i = 1; i <= USERS_COUNT; i++) {
    users.push(
      userRepo.create({
        name: `User ${i}`,
        email: `user${i}@test.com`,
      }),
    );
  }
  await userRepo.save(users);
  console.log(`Inserted ${users.length} users`);

  /** -----------------------------
   * PRODUCTS
   * ----------------------------- */
  const products: Product[] = [];
  for (let i = 1; i <= PRODUCTS_COUNT; i++) {
    products.push(
      productRepo.create({
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: randomInt(10, 500),
        stock: randomInt(100, 1000),
      }),
    );
  }
  await productRepo.save(products);
  console.log(`Inserted ${products.length} products`);

  /** -----------------------------
   * ORDERS
   * ----------------------------- */
  const orders: Order[] = [];
  for (let i = 0; i < ORDERS_COUNT; i++) {
    const user = users[randomInt(0, users.length - 1)];

    orders.push(
      orderRepo.create({
        user,
        status: 'completed',
        total: 0,
      }),
    );
  }
  await orderRepo.save(orders);
  console.log(`Inserted ${orders.length} orders`);

  /** -----------------------------
   * ORDER ITEMS (100,000)
   * ----------------------------- */
  let inserted = 0;

  while (inserted < ORDER_ITEMS_COUNT) {
    const batch: OrderItem[] = [];

    for (let i = 0; i < BATCH_SIZE && inserted < ORDER_ITEMS_COUNT; i++) {
      const order = orders[randomInt(0, orders.length - 1)];
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 5);

      batch.push(
        itemRepo.create({
          order,
          product,
          quantity,
        }),
      );

      inserted++;
    }

    await itemRepo.save(batch);
    console.log(`Inserted ${inserted}/${ORDER_ITEMS_COUNT} order items`);
  }

  console.log('Seed completed successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
