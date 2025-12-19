import { runQueries } from './queries';

async function main() {
  await runQueries();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
