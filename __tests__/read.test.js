// @ts-check
import { fastify } from 'fastify';
import init from '../server/plugin.js';
import { prepareUsersData, signInUser } from './helpers/index.js';

let app;
let knex;

beforeAll(async () => {
  app = fastify({
    exposeHeadRoutes: false,
    logger: { transport: { target: 'pino-pretty' } },
  });
  await init(app);
  knex = app.objection.knex;
});

beforeEach(async () => {
  await knex.migrate.rollback();
  await knex.migrate.latest();
  await prepareUsersData(app);
});

describe('test entity index views', () => {
  it.each([
    ['labels'],
    ['statuses'],
    ['tasks'],
  ])('%s are not visible when unauthorized', async (entity) => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(entity),
    });
    expect(response.statusCode).toBe(302);
  });

  it.each([
    ['labels'],
    ['statuses'],
    ['tasks'],
  ])('%s are visible when authorized', async (entity) => {
    const authCookie = await signInUser(app);
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(entity),
      cookies: authCookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it.each([
    ['users'],
  ])('%s are visible when unauthorized', async (entity) => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(entity),
    });
    expect(response.statusCode).toBe(200);
  });
});

describe('test entity creation views', () => {
  it.each([
    ['Label'],
    ['Status'],
    ['Task'],
  ])('New %s view is not visible when unauthorized', async (entity) => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(`new${entity}`),
    });
    expect(response.statusCode).toBe(302);
  });

  it.each([
    ['Label'],
    ['Status'],
    ['Task'],
  ])('New %s view is visible when authorized', async (entity) => {
    const authCookie = await signInUser(app);
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(`new${entity}`),
      cookies: authCookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it.each([
    ['User'],
  ])('New %s view is visible when unauthorized', async (entity) => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse(`new${entity}`),
    });
    expect(response.statusCode).toBe(200);
  });
});

// afterEach(async () => {
//   await knex('users').truncate();
//   await knex('labels').truncate();
//   await knex('statuses').truncate();
//   await knex('tasks').truncate();
//   await knex('tasks_labels').truncate();
// });

afterAll(async () => {
  await app.close();
});
