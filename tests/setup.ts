import { database } from '../src/config/database';

beforeAll(async () => {
  await database.ready();
});

beforeEach(async () => {
  await database.clearTables();
});

afterAll(() => {
  database.close();
});
