// @ts-check

import _ from 'lodash';
import { fastify } from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareUsersData, signInUser } from './helpers/index.js';

describe('test users CUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      // logger: { transport: { target: 'pino-pretty' } },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareUsersData(app);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('update', async () => {
    const id = 1;
    const params = testData.update;
    const requestBody = {
      method: 'PATCH',
      url: `/users/${id}`,
      payload: {
        data: params,
      },
    };
    const userBefore = await models.user.query().findById(id);
    const responseNoAuth = await app.inject(requestBody);
    expect(responseNoAuth.statusCode).toBe(302);

    const authCookie = await signInUser(app);
    const responseWithAuth = await app.inject({
      ...requestBody,
      cookies: authCookie,
    });

    expect(responseWithAuth.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const userAfter = await models.user.query().findById(1);
    expect({ ...userBefore, ...expected }).toMatchObject(userAfter);
  });

  it('delete', async () => {
    const id = 2;
    const authCookie = await signInUser(app);
    const requestBody = {
      method: 'DELETE',
      url: `/users/${id}`,
    };
    const responseNoAuth = await app.inject(requestBody);

    expect(responseNoAuth.statusCode).toBe(302);
    const responseWithAuth = await app.inject({
      ...requestBody,
      cookies: authCookie,
    });
    expect(responseWithAuth.statusCode).toBe(302);
    const deletedUser = await models.user.query().findById(id);
    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
