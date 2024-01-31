// @ts-check
import { fastify } from 'fastify';
import init from '../server/plugin.js';
import { prepareStatusesData, createRandomStatus, signInUser } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { transport: { target: 'pino-pretty' } },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareStatusesData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statusNew'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = createRandomStatus();
    const requestBody = {
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
    };
    const responseNoAuth = await app.inject(requestBody);
    expect(responseNoAuth.statusCode).toBe(401);

    const authCookie = await signInUser(app);
    const responseWithAuth = await app.inject({
      ...requestBody,
      cookies: authCookie,
    });
    expect(responseWithAuth.statusCode).toBe(302);
    const status = await models.status.query().findOne({ name: params.name });
    expect(status).toMatchObject(params);
  });

  it('update', async () => {
    const id = 1;
    const statusUpdateData = createRandomStatus();
    const requestBody = {
      method: 'PATCH',
      url: `/statuses/${id}`,
      payload: {
        data: statusUpdateData,
      },
    };
    const responseNoAuth = await app.inject(requestBody);
    expect(responseNoAuth.statusCode).toBe(401);

    const authCookie = await signInUser(app);
    const statusBefore = await models.status.query().findById(id);

    const responseWithAuth = await app.inject({
      ...requestBody,
      cookies: authCookie,
    });
    expect(responseWithAuth.statusCode).toBe(302);

    const statusAfter = await models.status.query().findById(id);
    expect({ ...statusBefore, ...statusUpdateData }).toMatchObject(statusAfter);
  });

  it('delete', async () => {
    const id = 1;
    const requestBody = {
      method: 'DELETE',
      url: `/statuses/${id}`,
    };
    const responseNoAuth = await app.inject(requestBody);
    expect(responseNoAuth.statusCode).toBe(401);

    const authCookie = await signInUser(app);
    const responseWithAuth = await app.inject({
      ...requestBody,
      cookies: authCookie,
    });
    expect(responseWithAuth.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findById(id);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});