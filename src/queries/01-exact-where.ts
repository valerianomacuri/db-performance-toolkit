import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

(async () => {
  await AppDataSource.initialize();

  const user = await AppDataSource.getRepository(User).findOne({
    where: { email: 'user1@test.com' },
    select: ['id', 'email'],
  });

  const plan = await AppDataSource.query(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT id, email
    FROM "user"
    WHERE email = 'user1@test.com';
  `);

  console.log('Execution plan (exact WHERE):');
  console.table(plan);
  console.log('User:', user);

  await AppDataSource.destroy();
})();
