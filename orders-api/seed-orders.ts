import dataSource from './src/database/data-source';
import { generateOrder } from './src/utils/tests/data-generators/orders.generator';
import { Order } from './src/modules/orders/entities/order.entity';
import { faker } from '@faker-js/faker';
import { generatePublicId } from './src/utils/public-id-generator';

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot see data in prod');
  }

  const SEED_COUNT = parseInt(
    process.env.SEED_COUNT ?? (2_000_000).toString(),
    10,
  );
  const CHUNK_SIZE = 7_00;

  console.log(`Seeding ${SEED_COUNT} orders`);

  const ds = await dataSource.initialize();

  function* orderGenerator(count: number) {
    for (let i = 0; i < count; i++) {
      yield ds.manager.create(
        Order,
        generateOrder({
          orderNumber: 'Order_' + faker.string.alphanumeric({ length: 11 }),
          publicId: generatePublicId(),
        }),
      );
    }
  }

  const gen = orderGenerator(SEED_COUNT);
  let chunk: Order[] = [];
  let total = 0;
  for (const order of gen) {
    chunk.push(order);
    if (chunk.length === CHUNK_SIZE) {
      await ds.manager.save(chunk);
      total += chunk.length;
      console.log(`Seeded ${total} orders`);
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    await ds.manager.save(chunk);
    total += chunk.length;
    console.log(`Seeded ${total} orders`);
  }
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
